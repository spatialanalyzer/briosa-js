[CmdletBinding()]
param(
    [Parameter(Mandatory)][string]$SourceTarget,
    [string]$FixtureExecutable
)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$targetRoot = Split-Path -Parent $PSScriptRoot
$protocol = Get-Content (Join-Path $targetRoot 'protocol.lock.json') -Raw | ConvertFrom-Json
$source = [IO.Path]::GetFullPath($SourceTarget, $targetRoot)
$output = Join-Path $targetRoot 'artifacts/current-conformance'
$sourceRoot = (Split-Path (Split-Path $source -Parent) -Parent).Replace('\', '/')
$actual = [string](& git -c "safe.directory=$sourceRoot" -C $sourceRoot rev-parse HEAD)
if ($LASTEXITCODE -ne 0 -or $actual.Trim() -cne $protocol.artifact.source_revision) {
    throw 'Current-server conformance must build the exact pinned generation source.'
}
Push-Location $source
try {
    $build = @{ Version = $protocol.artifact.briosa_version; SourceRevision = $protocol.artifact.source_revision; OutputDirectory = $output }
    & (Join-Path $source 'eng/New-ClientConformancePackage.ps1') @build
}
finally { Pop-Location }
$name = "briosa-client-conformance-$($protocol.artifact.briosa_version)-sa-$($protocol.target.spatial_analyzer)-win-x64"
$artifact = Join-Path $output "$name.zip"
$provenance = Get-Content (Join-Path $output "$name.provenance.json") -Raw | ConvertFrom-Json
if ($provenance.artifactName -cne $name -or $provenance.sourceRevision -cne $protocol.artifact.source_revision -or
    $provenance.spatialAnalyzerTarget -cne $protocol.target.spatial_analyzer) {
    throw 'Built conformance provenance differs from the requested product.'
}
$lock = [ordered]@{
    schema_version = 1
    artifact = @{
        name = $name; file_name = "$name.zip"
        sha256 = (Get-FileHash -LiteralPath $artifact -Algorithm SHA256).Hash.ToLowerInvariant()
        briosa_version = $provenance.briosaVersion; source_revision = $provenance.sourceRevision
        source_repository = 'https://github.com/spatialanalyzer/briosa'
        source_channel = 'source_commit_bootstrap'
    }
    contract = @{ id = $provenance.scenarioContract; schema_version = $provenance.scenarioContractSchemaVersion }
    target = @{ spatial_analyzer = $provenance.spatialAnalyzerTarget; runtime_identifier = 'win-x64' }
}
$lockPath = Join-Path $output 'conformance.lock.json'
$lock | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath $lockPath -Encoding utf8
$arguments = @{
    ArtifactPath = $artifact
    LockPath = $lockPath
    EvidencePath = Join-Path $output 'evidence.json'
}
$arguments.NodeExecutable = $(if ($FixtureExecutable) { $FixtureExecutable } else { 'node' })
& (Join-Path $PSScriptRoot 'Test-Conformance.ps1') @arguments
