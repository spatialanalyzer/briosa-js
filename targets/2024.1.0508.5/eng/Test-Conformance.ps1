[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [string]$ArtifactPath,

    [string]$LockPath = "conformance.lock.json",

    [string]$EvidencePath,

    [string]$FixturePath,

    [hashtable]$ClientPackage,

    [string]$NodeExecutable = "node"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if (-not $IsWindows -or -not [Environment]::Is64BitProcess) {
    throw "The shared client conformance suite requires 64-bit Windows."
}

$repositoryRoot = Split-Path -Parent $PSScriptRoot
$resolvedArtifact = [IO.Path]::GetFullPath($ArtifactPath, $repositoryRoot)
$lock = Get-Content -LiteralPath ([IO.Path]::GetFullPath($LockPath, $repositoryRoot)) -Raw |
    ConvertFrom-Json
$temporaryBase = [IO.Path]::GetFullPath([IO.Path]::GetTempPath())
$temporaryRoot = Join-Path $temporaryBase "briosa-js-conformance-$([Guid]::NewGuid().ToString('N'))"

if (-not (Test-Path -LiteralPath $resolvedArtifact -PathType Leaf)) {
    throw "The conformance artifact does not exist."
}
$artifactHash = (Get-FileHash -LiteralPath $resolvedArtifact -Algorithm SHA256).Hash.ToLowerInvariant()
if ($artifactHash -ne $lock.artifact.sha256) {
    throw "The conformance artifact SHA-256 does not match conformance.lock.json."
}
$externalChecksum = (Get-Content -LiteralPath "$resolvedArtifact.sha256" -Raw).Trim()
if ($externalChecksum -ne "$artifactHash  $([IO.Path]::GetFileName($resolvedArtifact))") {
    throw "The adjacent conformance artifact checksum is invalid."
}

[IO.Directory]::CreateDirectory($temporaryRoot) | Out-Null
# Portable conformance owns fake processes and must not launch a desktop monitor.
$previousDesktopMode = [Environment]::GetEnvironmentVariable("Briosa__Desktop__Mode")
$env:Briosa__Desktop__Mode = "Disabled"
try {
    Expand-Archive -LiteralPath $resolvedArtifact -DestinationPath $temporaryRoot
    $packageRoots = @(Get-ChildItem -LiteralPath $temporaryRoot -Directory)
    if ($packageRoots.Count -ne 1) {
        throw "The conformance artifact must contain exactly one root directory."
    }
    $packageRoot = $packageRoots[0].FullName
    $manifest = Get-Content -LiteralPath (Join-Path $packageRoot "manifest.json") -Raw |
        ConvertFrom-Json
    if ($manifest.artifactKind -ne "briosa_client_conformance" -or
        $manifest.artifactName -ne $lock.artifact.name -or
        $manifest.briosaVersion -ne $lock.artifact.briosa_version -or
        $manifest.sourceRevision -ne $lock.artifact.source_revision -or
        $manifest.spatialAnalyzerTarget -ne $lock.target.spatial_analyzer -or
        $manifest.scenarioContract -ne $lock.contract.id -or
        $manifest.scenarioContractSchemaVersion -ne $lock.contract.schema_version) {
        throw "The conformance artifact identity does not match conformance.lock.json."
    }

    $runner = Join-Path $packageRoot "runner\Invoke-BriosaClientConformance.ps1"
    $tsx = Join-Path $repositoryRoot "node_modules\tsx\dist\cli.mjs"
    $fixture = Join-Path $repositoryRoot "tools\conformance.ts"
    if ($FixturePath) { $fixture = [IO.Path]::GetFullPath($FixturePath, $repositoryRoot) }
    & $runner `
        -FixtureCommand $NodeExecutable `
        -FixtureArguments @($tsx, $fixture)
    if (-not [string]::IsNullOrWhiteSpace($EvidencePath)) {
        $protocol = Get-Content (Join-Path $repositoryRoot "protocol.lock.json") -Raw | ConvertFrom-Json
        $scenarios = Get-Content (Join-Path $packageRoot "contract/scenarios.json") -Raw | ConvertFrom-Json
        $clientRoot = (Split-Path (Split-Path $repositoryRoot -Parent) -Parent).Replace('\', '/')
        $clientRevision = [string](& git -c "safe.directory=$clientRoot" -C $clientRoot rev-parse HEAD)
        if ($LASTEXITCODE -ne 0) { throw "Cannot identify client source for evidence." }
        $dirty = @(& git -c "safe.directory=$clientRoot" -C $clientRoot status --porcelain).Count -ne 0
        if ($LASTEXITCODE -ne 0) { throw "Cannot identify client worktree state." }
        $report = [ordered]@{
            schemaVersion = 1
            generatedAt = [DateTimeOffset]::UtcNow.ToString("O")
            validationKind = $(if ($ClientPackage) { "packaged-client-and-server-fake-sdk" } else { "packaged-server-fake-sdk" })
            passed = $true
            licensedSpatialAnalyzer = $false
            client = @{
                repository = "https://github.com/spatialanalyzer/briosa-js"
                version = (Get-Content (Join-Path $repositoryRoot "package.json") -Raw | ConvertFrom-Json).version
                sourceRevision = $clientRevision
                uncommittedChanges = $dirty
                package = $ClientPackage
                protocolArtifact = $protocol.artifact
                requiredContract = @{ major = 1; minimumRevision = 0 }
            }
            server = $lock.artifact
            target = $lock.target
            scenarioContract = $lock.contract
            scenarios = @($scenarios.scenarios.id)
        }
        $destination = [IO.Path]::GetFullPath($EvidencePath, $repositoryRoot)
        [IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($destination)) | Out-Null
        $json = ($report | ConvertTo-Json -Depth 12) + [Environment]::NewLine
        $stream = [IO.File]::Open($destination, [IO.FileMode]::CreateNew, [IO.FileAccess]::Write)
        try { $bytes = [Text.UTF8Encoding]::new($false).GetBytes($json); $stream.Write($bytes) }
        finally { $stream.Dispose() }
    }
}
finally {
    [Environment]::SetEnvironmentVariable("Briosa__Desktop__Mode", $previousDesktopMode)
    $resolvedTemporaryRoot = [IO.Path]::GetFullPath($temporaryRoot)
    if ($resolvedTemporaryRoot.StartsWith($temporaryBase, [StringComparison]::OrdinalIgnoreCase) -and
        (Test-Path -LiteralPath $resolvedTemporaryRoot)) {
        Remove-Item -LiteralPath $resolvedTemporaryRoot -Recurse -Force
    }
}
