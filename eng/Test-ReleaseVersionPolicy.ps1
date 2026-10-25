[CmdletBinding()]
param()

# Runs eng/Test-ReleaseVersion.ps1 in a throwaway git repository that holds a
# copy of this repository's release metadata, and checks which dispatch refs,
# versions, and existing tags it accepts. Each case runs in a child pwsh the way
# GitHub Actions runs a pwsh step, so a leftover native exit code fails it.

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$pwshPath = (Get-Process -Id $PID).Path
$targets = @(Get-ChildItem -LiteralPath (Join-Path $root 'targets') -Directory | Sort-Object Name)
if ($targets.Count -eq 0) { throw 'No exact-target products found under targets/.' }
$metadataFiles = @(
    'protocol.lock.json'
    'src/Briosa.Client/Briosa.Client.csproj'
    'package.json'
    'pyproject.toml'
)

function Get-PackageVersion([string]$Product) {
    $project = Join-Path $Product 'src/Briosa.Client/Briosa.Client.csproj'
    $npm = Join-Path $Product 'package.json'
    if (Test-Path -LiteralPath $project) {
        $text = Get-Content -LiteralPath $project -Raw
        return [regex]::Match($text, '<VersionPrefix>([^<]+)</VersionPrefix>').Groups[1].Value
    }
    if (Test-Path -LiteralPath $npm) {
        return [string](Get-Content -LiteralPath $npm -Raw | ConvertFrom-Json).version
    }
    $text = Get-Content -LiteralPath (Join-Path $Product 'pyproject.toml') -Raw
    return [regex]::Match($text, '(?m)^version = "([^"]+)"').Groups[1].Value
}

$versions = @($targets | ForEach-Object { Get-PackageVersion $_.FullName } | Sort-Object -Unique)
$parsed = [regex]::Match([string]($versions -join ','), '^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$')
if ($versions.Count -ne 1 -or -not $parsed.Success) {
    throw "Expected one MAJOR.MINOR.PATCH package version shared by all targets, found '$($versions -join ', ')'."
}
$version = $versions[0]
$otherVersion = '{0}.{1}.{2}' -f $parsed.Groups[1].Value, $parsed.Groups[2].Value, ([int]$parsed.Groups[3].Value + 1)

$tempRoot = [IO.Path]::GetFullPath([IO.Path]::GetTempPath())
$fixture = Join-Path $tempRoot ('briosa-release-policy-' + [guid]::NewGuid().ToString('N'))
$fixtureScript = Join-Path $fixture 'eng/Test-ReleaseVersion.ps1'
$failures = [Collections.Generic.List[string]]::new()

function Invoke-FixtureGit {
    $output = & git -C $fixture @args 2>&1
    if ($LASTEXITCODE -ne 0) { throw "git $($args -join ' ') failed: $($output | Out-String)" }
    $output
}

function Test-Case {
    param(
        [Parameter(Mandatory)][string]$Name,
        [Parameter(Mandatory)][string]$Version,
        [Parameter(Mandatory)][string]$Ref,
        [Parameter(Mandatory)][string]$Commit,
        [switch]$Publish,
        [string]$Rejection
    )
    $quote = { param([string]$Value) "'" + $Value.Replace("'", "''") + "'" }
    $invocation = '& {0} -Version {1} -Ref {2} -Commit {3}' -f (& $quote $fixtureScript), (& $quote $Version), (& $quote $Ref), (& $quote $Commit)
    if ($Publish) { $invocation += ' -Publish' }
    $command = "`$ErrorActionPreference = 'Stop'; $invocation; if (Test-Path -LiteralPath variable:\LASTEXITCODE) { exit `$LASTEXITCODE }"
    $output = & $pwshPath -NoLogo -NoProfile -NonInteractive -Command $command 2>&1 | Out-String
    $exitCode = $LASTEXITCODE
    $global:LASTEXITCODE = 0
    $text = ($output -replace '\x1b\[[0-9;]*m', '' -replace '\s+', ' ').Trim()
    if ($Rejection) {
        $passed = $exitCode -ne 0 -and $text.Contains($Rejection)
        $expected = "rejection containing '$Rejection'"
    } else {
        $passed = $exitCode -eq 0 -and $text.Contains('Validated')
        $expected = 'acceptance with exit code 0'
    }
    if ($passed) {
        Write-Host "  ok    $Name"
    } else {
        Write-Host "  FAIL  $Name"
        Write-Host "        expected $expected; exit code $exitCode; output: $text"
        $failures.Add($Name)
    }
}

try {
    New-Item -ItemType Directory -Path (Split-Path -Parent $fixtureScript) -Force | Out-Null
    Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'Test-ReleaseVersion.ps1') -Destination $fixtureScript
    foreach ($target in $targets) {
        foreach ($relative in $metadataFiles) {
            $source = Join-Path $target.FullName $relative
            if (-not (Test-Path -LiteralPath $source)) { continue }
            $destination = Join-Path $fixture "targets/$($target.Name)/$relative"
            New-Item -ItemType Directory -Path (Split-Path -Parent $destination) -Force | Out-Null
            Copy-Item -LiteralPath $source -Destination $destination
        }
    }

    Invoke-FixtureGit init --quiet --initial-branch=main | Out-Null
    Invoke-FixtureGit config user.name 'Release policy test' | Out-Null
    Invoke-FixtureGit config user.email 'release-policy-test@invalid' | Out-Null
    Invoke-FixtureGit add --all | Out-Null
    Invoke-FixtureGit commit --quiet --message 'Release metadata fixture' | Out-Null
    $earlier = [string](Invoke-FixtureGit rev-parse HEAD)
    Invoke-FixtureGit commit --quiet --allow-empty --message 'Release commit' | Out-Null
    $commit = [string](Invoke-FixtureGit rev-parse HEAD)
    $tag = "refs/tags/v$version"

    Write-Host "Release version policy (package version $version):"
    Test-Case -Name 'main with publish is accepted' -Version $version -Ref 'refs/heads/main' -Commit $commit -Publish
    Test-Case -Name 'main dry run is accepted' -Version $version -Ref 'refs/heads/main' -Commit $commit
    Test-Case -Name 'another branch dry run is accepted' -Version $version -Ref 'refs/heads/release-check' -Commit $commit
    Test-Case -Name 'another branch with publish is rejected' -Version $version -Ref 'refs/heads/release-check' -Commit $commit -Publish -Rejection 'Publish only from main'
    Test-Case -Name 'a tag ref with publish is rejected' -Version $version -Ref $tag -Commit $commit -Publish -Rejection 'Dispatch releases from main; publishing the draft release creates the tag'
    Test-Case -Name 'a tag ref dry run is rejected' -Version $version -Ref $tag -Commit $commit -Rejection 'Dispatch releases from main; publishing the draft release creates the tag'
    Test-Case -Name 'a pull request ref is rejected' -Version $version -Ref 'refs/pull/1/merge' -Commit $commit -Rejection 'Dispatch releases from a branch'
    Test-Case -Name 'a version that differs from the package versions is rejected' -Version $otherVersion -Ref 'refs/heads/main' -Commit $commit -Publish -Rejection 'disagrees with'
    Test-Case -Name 'a v-prefixed version is rejected' -Version "v$version" -Ref 'refs/heads/main' -Commit $commit -Publish -Rejection 'MAJOR.MINOR.PATCH'
    Test-Case -Name 'an abbreviated commit is rejected' -Version $version -Ref 'refs/heads/main' -Commit $commit.Substring(0, 12) -Publish -Rejection 'full commit SHA'

    Invoke-FixtureGit update-ref $tag $commit | Out-Null
    Test-Case -Name 'an existing tag at the release commit is accepted' -Version $version -Ref 'refs/heads/main' -Commit $commit -Publish
    Invoke-FixtureGit update-ref -d $tag | Out-Null
    Invoke-FixtureGit tag --annotate --message "v$version" "v$version" $commit | Out-Null
    Test-Case -Name 'an existing annotated tag at the release commit is accepted' -Version $version -Ref 'refs/heads/main' -Commit $commit -Publish
    Invoke-FixtureGit tag --delete "v$version" | Out-Null
    Invoke-FixtureGit update-ref $tag $earlier | Out-Null
    Test-Case -Name 'an existing tag at another commit is rejected' -Version $version -Ref 'refs/heads/main' -Commit $commit -Publish -Rejection 'already exists'
    Test-Case -Name 'an existing tag at another commit is rejected in a dry run' -Version $version -Ref 'refs/heads/release-check' -Commit $commit -Rejection 'already exists'
} finally {
    $resolved = [IO.Path]::GetFullPath($fixture)
    $leaf = Split-Path -Leaf $resolved
    if ($resolved.StartsWith($tempRoot, [StringComparison]::OrdinalIgnoreCase) -and
        $resolved.Length -gt $tempRoot.Length -and
        $leaf.StartsWith('briosa-release-policy-', [StringComparison]::Ordinal) -and
        (Test-Path -LiteralPath $resolved)) {
        Remove-Item -LiteralPath $resolved -Recurse -Force
    }
}

if ($failures.Count -gt 0) {
    throw "$($failures.Count) release version policy case(s) failed: $($failures -join '; ')"
}
Write-Host 'Release version policy holds.'
