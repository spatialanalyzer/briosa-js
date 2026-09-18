[CmdletBinding()]
param([Parameter(Mandatory)][string]$ReleaseTag)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
if ($ReleaseTag -notmatch '^refs/tags/v(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$') {
    throw 'Run releases from a vMAJOR.MINOR.PATCH tag, never a branch.'
}
$version = $ReleaseTag.Substring('refs/tags/v'.Length)
$root = Split-Path -Parent $PSScriptRoot
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
    if ($actual -cne $version) { throw "Tag version $version disagrees with $target package version $actual" }
}
Write-Host "Validated both exact-target identities and release version $version."
