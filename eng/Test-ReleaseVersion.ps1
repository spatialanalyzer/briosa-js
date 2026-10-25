[CmdletBinding()]
param(
    [Parameter(Mandatory)][string]$Version,
    [Parameter(Mandatory)][string]$Ref,
    [Parameter(Mandatory)][string]$Commit,
    [switch]$Publish
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$PSNativeCommandUseErrorActionPreference = $false
if ($Version -cnotmatch '^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$') {
    throw "Release version must be MAJOR.MINOR.PATCH without a v prefix, not '$Version'."
}
if ($Ref.StartsWith('refs/tags/', [StringComparison]::Ordinal)) {
    throw 'Dispatch releases from main; publishing the draft release creates the tag.'
}
if (-not $Ref.StartsWith('refs/heads/', [StringComparison]::Ordinal)) {
    throw "Dispatch releases from a branch, not '$Ref'."
}
if ($Publish -and $Ref -cne 'refs/heads/main') {
    throw "Publish only from main. Dispatch '$Ref' with publish=false for a validation-only dry run."
}
if ($Commit -cnotmatch '^([0-9a-f]{40}|[0-9a-f]{64})$') {
    throw "Release commit must be a full commit SHA, not '$Commit'."
}
$root = Split-Path -Parent $PSScriptRoot
$tag = "v$Version"
$tagCommit = git -C $root rev-parse --verify --quiet "refs/tags/$($tag)^{commit}"
if ($LASTEXITCODE -eq 1) {
    $global:LASTEXITCODE = 0
} elseif ($LASTEXITCODE -ne 0) {
    throw "Could not inspect tag $tag (git exit code $LASTEXITCODE)."
} elseif ([string]$tagCommit -cne $Commit) {
    throw "Tag $tag already exists at $tagCommit, not at release commit $Commit. Release a new version."
}
foreach ($target in @('2024.1.0508.5', '2026.1.0529.7')) {
    $product = Join-Path $root "targets/$target"
    $lock = Get-Content (Join-Path $product 'protocol.lock.json') -Raw | ConvertFrom-Json
    if ($lock.target.spatial_analyzer -cne $target) { throw "Wrong protocol target: $target" }
    $project = Join-Path $product 'src/Briosa.Client/Briosa.Client.csproj'
    $npm = Join-Path $product 'package.json'
    if (Test-Path $project) {
        [xml]$metadata = Get-Content $project -Raw
        $actual = [string]$metadata.Project.PropertyGroup.VersionPrefix
        if ($metadata.Project.PropertyGroup.PackageId -cne "Briosa.$target") { throw 'Wrong NuGet identity' }
    } elseif (Test-Path $npm) {
        $metadata = Get-Content $npm -Raw | ConvertFrom-Json
        $actual = [string]$metadata.version
        if ($metadata.name -cne "@spatialanalyzer/briosa-$target") { throw 'Wrong npm identity' }
    } else {
        $metadata = Get-Content (Join-Path $product 'pyproject.toml') -Raw
        $actual = [regex]::Match($metadata, '(?m)^version = "([^"]+)"$').Groups[1].Value
        $name = [regex]::Match($metadata, '(?m)^name = "([^"]+)"$').Groups[1].Value
        if ($name -cne ('briosa-' + $target.Replace('.', '-'))) { throw 'Wrong PyPI identity' }
    }
    if ($actual -cne $Version) { throw "Release version $Version disagrees with $target package version $actual" }
}
$mode = if ($Publish) { 'publish' } else { 'validation-only dry run' }
Write-Host "Validated $Ref at $Commit ($mode): both exact-target identities and release version $Version."
