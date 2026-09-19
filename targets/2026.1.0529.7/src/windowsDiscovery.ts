import { execFile } from 'node:child_process';
import { join } from 'node:path';
import { object } from './installationMetadata.js';

const preamble = String.raw`
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
[Console]::InputEncoding = [Text.UTF8Encoding]::new($false)
[Console]::OutputEncoding = [Text.UTF8Encoding]::new($false)
`;
const registryScript =
  preamble +
  String.raw`
$principal = [Security.Principal.WindowsPrincipal]::new([Security.Principal.WindowsIdentity]::GetCurrent())
$elevated = $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
$entries = @()
$diagnostics = @()
foreach ($scope in @('machine','user')) {
  if ($elevated -and $scope -eq 'user') { continue }
  $hive = if ($scope -eq 'machine') { [Microsoft.Win32.RegistryHive]::LocalMachine } else { [Microsoft.Win32.RegistryHive]::CurrentUser }
  $base = $null; $root = $null
  try {
    $base = [Microsoft.Win32.RegistryKey]::OpenBaseKey($hive,[Microsoft.Win32.RegistryView]::Registry64)
    $root = $base.OpenSubKey('Software\Briosa\Installations')
    if ($null -eq $root) { continue }
    foreach ($id in ($root.GetSubKeyNames() | Select-Object -First 1000)) {
      $key = $null
      try {
        $key = $root.OpenSubKey($id)
        if ($key.GetValueKind('Registration') -ne [Microsoft.Win32.RegistryValueKind]::String) { throw 'kind' }
        $raw = $key.GetValue('Registration',$null,[Microsoft.Win32.RegistryValueOptions]::DoNotExpandEnvironmentNames)
        if ($raw -isnot [string] -or $raw.Length -gt 32768) { throw 'size' }
        $entries += @{ id=$id; scope=$scope; registration=$raw }
      } catch { $diagnostics += @{ path=($scope + ':' + $id); code='server-registration-invalid' } }
      finally { if ($null -ne $key) { $key.Dispose() } }
    }
  } catch { $diagnostics += @{ path=$scope; code='server-registration-unavailable' } }
  finally { if ($null -ne $root) { $root.Dispose() }; if ($null -ne $base) { $base.Dispose() } }
}
@{ elevated=$elevated; registrations=@($entries); diagnostics=@($diagnostics) } | ConvertTo-Json -Depth 5 -Compress
`;
export const windowsAclPolicyScript = String.raw`
function Test-BriosaAcl($acl, [bool]$includeWrite) {
  $descriptor = [Security.AccessControl.RawSecurityDescriptor]::new($acl.GetSecurityDescriptorBinaryForm(), 0)
  if ($null -eq $descriptor.DiscretionaryAcl) { return $false }
  $trusted = @('S-1-5-32-544','S-1-5-18','S-1-5-80-956008885-3418522649-1831038044-1853292631-2271478464')
  if ($trusted -notcontains $acl.GetOwner([Security.Principal.SecurityIdentifier]).Value) { return $false }
  $changes = [Security.AccessControl.FileSystemRights]'Delete,DeleteSubdirectoriesAndFiles,ChangePermissions,TakeOwnership'
  if ($includeWrite) { $changes = $changes -bor [Security.AccessControl.FileSystemRights]::Write }
  foreach ($rule in $acl.GetAccessRules($true,$true,[Security.Principal.SecurityIdentifier])) {
    if ($rule.AccessControlType -ne 'Allow' -or ($rule.PropagationFlags -band [Security.AccessControl.PropagationFlags]::InheritOnly) -ne 0) { continue }
    $genericWrite = ([int64]$rule.FileSystemRights -band 0x50000000) -ne 0
    if ((($rule.FileSystemRights -band $changes) -ne 0 -or $genericWrite) -and $trusted -notcontains $rule.IdentityReference.Value) { return $false }
  }
  return $true
}
`;
const protectionScript =
  preamble +
  windowsAclPolicyScript +
  String.raw`
try {
  $path = [Console]::In.ReadToEnd() | ConvertFrom-Json
  $payload = [IO.Path]::GetDirectoryName($path)
  $pending = [Collections.Generic.Stack[IO.DirectoryInfo]]::new()
  $pending.Push([IO.DirectoryInfo]::new($payload))
  $count = 0
  while ($pending.Count -gt 0) {
    $current = $pending.Pop()
    foreach ($item in $current.EnumerateFileSystemInfos()) {
      $count++
      if ($count -gt 10000 -or ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) { throw 'layout' }
      if (-not (Test-BriosaAcl (Get-Acl -LiteralPath $item.FullName) $true)) { throw 'access' }
      if ($item -is [IO.DirectoryInfo]) { $pending.Push($item) }
    }
  }
  $directory = [IO.DirectoryInfo]::new($payload)
  while ($null -ne $directory.Parent) {
    if (-not (Test-BriosaAcl (Get-Acl -LiteralPath $directory.FullName) ($directory.FullName -eq $payload))) { throw 'access' }
    $directory = $directory.Parent
  }
  [Console]::Write('true')
} catch { [Console]::Write('false') }
`;
export function runWindowsAdapter(script: string, input = ''): Promise<string> {
  return new Promise((resolve, reject) => {
    const executable = join(
      process.env.SYSTEMROOT ?? 'C:\\Windows',
      'System32',
      'WindowsPowerShell',
      'v1.0',
      'powershell.exe',
    );
    const child = execFile(
      executable,
      [
        '-NoProfile',
        '-NonInteractive',
        '-EncodedCommand',
        Buffer.from(script, 'utf16le').toString('base64'),
      ],
      {
        windowsHide: true,
        // Windows PowerShell's first launch can initialize system modules.
        timeout: 30000,
        maxBuffer: 8 * 1024 * 1024,
        encoding: 'utf8',
      },
      (error, stdout) => {
        if (error)
          reject(
            new Error('Windows discovery adapter failed.', { cause: error }),
          );
        else resolve(stdout);
      },
    );
    child.stdin?.on('error', () => {
      /* Exit/timeout is reported by execFile. */
    });
    child.stdin?.end(input, 'utf8');
  });
}
export async function readWindowsRegistrations(): Promise<
  Record<string, unknown>
> {
  const value: unknown = JSON.parse(await runWindowsAdapter(registryScript));
  const result = object(value);
  if (
    typeof result.elevated !== 'boolean' ||
    !Array.isArray(result.registrations) ||
    !Array.isArray(result.diagnostics)
  )
    throw new Error('Invalid Registry adapter result.');
  return result;
}
export async function isProtectedInstallation(path: string): Promise<boolean> {
  try {
    return (
      (
        await runWindowsAdapter(protectionScript, JSON.stringify(path))
      ).trim() === 'true'
    );
  } catch {
    return false;
  }
}
