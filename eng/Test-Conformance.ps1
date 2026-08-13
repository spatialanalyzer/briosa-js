[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [string]$ArtifactPath,

    [string]$NodeExecutable = "node"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if (-not $IsWindows -or -not [Environment]::Is64BitProcess) {
    throw "The shared client conformance suite requires 64-bit Windows."
}

$repositoryRoot = Split-Path -Parent $PSScriptRoot
$resolvedArtifact = [IO.Path]::GetFullPath($ArtifactPath, $repositoryRoot)
$lock = Get-Content -LiteralPath (Join-Path $repositoryRoot "conformance.lock.json") -Raw |
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
    & $runner `
        -FixtureCommand $NodeExecutable `
        -FixtureArguments @($tsx, $fixture)
}
finally {
    $resolvedTemporaryRoot = [IO.Path]::GetFullPath($temporaryRoot)
    if ($resolvedTemporaryRoot.StartsWith($temporaryBase, [StringComparison]::OrdinalIgnoreCase) -and
        (Test-Path -LiteralPath $resolvedTemporaryRoot)) {
        Remove-Item -LiteralPath $resolvedTemporaryRoot -Recurse -Force
    }
}
