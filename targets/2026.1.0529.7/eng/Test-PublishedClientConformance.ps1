[CmdletBinding()]
param(
    [Parameter(Mandatory)][string]$ClientPackagePath,
    [Parameter(Mandatory)][ValidatePattern('^[a-f0-9]{64}$')][string]$ClientPackageSha256,
    [Parameter(Mandatory)][ValidatePattern('^[0-9]+\.[0-9]+\.[0-9]+(?:-[0-9A-Za-z.-]+)?$')][string]$ClientVersion,
    [Parameter(Mandatory)][string]$ArtifactPath,
    [Parameter(Mandatory)][string]$LockPath,
    [Parameter(Mandatory)][string]$EvidencePath,
    [string]$PublishedPackageUrl,
    [string]$FixtureExecutable = 'node'
)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$targetRoot = Split-Path -Parent $PSScriptRoot
$package = [IO.Path]::GetFullPath($ClientPackagePath, $targetRoot)
if ((Get-FileHash -LiteralPath $package -Algorithm SHA256).Hash.ToLowerInvariant() -cne $ClientPackageSha256) {
    throw 'Client package digest differs from the retained release record.'
}
$temporaryBase = [IO.Path]::GetFullPath([IO.Path]::GetTempPath())
$consumer = Join-Path $temporaryBase "briosa-published-consumer-$([Guid]::NewGuid().ToString('N'))"
[IO.Directory]::CreateDirectory($consumer) | Out-Null
$previousPythonPath = [Environment]::GetEnvironmentVariable('PYTHONPATH')
try {
    $expectedName = '@spatialanalyzer/briosa-2026.1.0529.7'
    Copy-Item -LiteralPath $package -Destination (Join-Path $consumer 'client.tgz')
    @{ private = $true; type = 'module'; dependencies = @{ briosa = 'file:./client.tgz' } } |
        ConvertTo-Json | Set-Content (Join-Path $consumer 'package.json') -Encoding utf8
    Push-Location $consumer
    try {
        $npmDirectory = Split-Path (Get-Command npm.cmd -ErrorAction Stop).Source -Parent
        $npmCli = Join-Path $npmDirectory 'node_modules/npm/bin/npm-cli.js'
        & $FixtureExecutable $npmCli install --ignore-scripts --no-audit --no-fund
        if ($LASTEXITCODE -ne 0) { throw 'Published Node consumer install failed.' }
    }
    finally { Pop-Location }
    $metadata = Get-Content (Join-Path $consumer 'node_modules/briosa/package.json') -Raw | ConvertFrom-Json
    if ($metadata.name -cne $expectedName -or $metadata.version -cne $ClientVersion) {
        throw 'npm package identity differs from the retained release record.'
    }
    $source = Get-Content (Join-Path $targetRoot 'tools/conformance.ts') -Raw
    if (-not $source.Contains("from '../src/index.js'")) { throw 'Conformance fixture public import changed.' }
    $fixture = Join-Path $consumer 'conformance.ts'
    $source.Replace("from '../src/index.js'", "from 'briosa'") | Set-Content $fixture -Encoding utf8
    $arguments = @{
        ArtifactPath = $ArtifactPath; LockPath = $LockPath; EvidencePath = $EvidencePath
        FixturePath = $fixture
        ClientPackage = @{
            name = $expectedName; version = $ClientVersion; sha256 = $ClientPackageSha256
            publishedUrl = $PublishedPackageUrl
        }
    }
    $arguments.NodeExecutable = $FixtureExecutable
    & (Join-Path $PSScriptRoot 'Test-Conformance.ps1') @arguments
}
finally {
    [Environment]::SetEnvironmentVariable('PYTHONPATH', $previousPythonPath)
    $resolved = [IO.Path]::GetFullPath($consumer)
    if (-not $resolved.StartsWith($temporaryBase, [StringComparison]::OrdinalIgnoreCase) -or $resolved -eq $temporaryBase) {
        throw 'Refusing cleanup outside the temporary consumer directory.'
    }
    if (Test-Path -LiteralPath $resolved) { Remove-Item -LiteralPath $resolved -Recurse -Force }
}
