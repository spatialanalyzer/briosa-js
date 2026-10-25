[CmdletBinding()]
param()

# Exercises eng/New-ReleaseDraft.ps1 against a process-local fake `gh`: the draft is
# created for the run's commit, reused only when it already belongs to that commit,
# and a refused creation fails with a maintainer recovery that keeps the commit.

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$script = Join-Path $PSScriptRoot 'New-ReleaseDraft.ps1'
$temporaryBase = [IO.Path]::GetFullPath([IO.Path]::GetTempPath())
$root = Join-Path $temporaryBase "briosa-release-draft-policy-$([Guid]::NewGuid().ToString('N'))"
$commit = '1111111111111111111111111111111111111111'
$other = '2222222222222222222222222222222222222222'
$savedSummary = $env:GITHUB_STEP_SUMMARY

# Fake GitHub state; each case sets it before running the script.
$global:BriosaDraftReleases = @()
$global:BriosaDraftTags = @{}
$global:BriosaDraftFail = ''
$global:BriosaDraftCalls = [Collections.Generic.List[string]]::new()

function global:gh {
    $arguments = @($args)
    $global:BriosaDraftCalls.Add($arguments -join ' ')
    $global:LASTEXITCODE = 0
    if ($arguments[0] -eq 'api' -and $arguments[1] -like 'repos/*/releases') {
        if ($global:BriosaDraftFail -eq 'list') { $global:LASTEXITCODE = 1; return }
        foreach ($release in $global:BriosaDraftReleases) { $release | ConvertTo-Json -Compress }
        return
    }
    if ($arguments[0] -eq 'api' -and $arguments[1] -like 'repos/*/git/matching-refs/tags/*') {
        if ($global:BriosaDraftFail -eq 'tags') { $global:LASTEXITCODE = 1; return }
        foreach ($name in $global:BriosaDraftTags.Keys) {
            $tag = $global:BriosaDraftTags[$name]
            # The fake returns what the script's --jq projection would.
            @{ ref = "refs/tags/$name"; type = $tag.Type; sha = $tag.Sha } | ConvertTo-Json -Compress
        }
        return
    }
    if ($arguments[0] -eq 'api' -and $arguments[1] -like 'repos/*/git/tags/*') {
        $sha = $arguments[1].Substring($arguments[1].LastIndexOf('/') + 1)
        foreach ($tag in $global:BriosaDraftTags.Values) {
            if ($tag.Sha -ceq $sha) { $tag.Commit; return }
        }
        $global:LASTEXITCODE = 1
        return
    }
    if ($arguments[0] -eq 'release' -and $arguments[1] -eq 'create') {
        if ($global:BriosaDraftFail -eq 'create') { $global:LASTEXITCODE = 1; return }
        'https://github.com/spatialanalyzer/fixture/releases/tag/untagged-1'
        return
    }
    throw "Unexpected gh call: $($arguments -join ' ')"
}

function Invoke-Draft([hashtable]$Parameters) {
    $env:GITHUB_STEP_SUMMARY = Join-Path $root "summary-$([Guid]::NewGuid().ToString('N')).md"
    $global:BriosaDraftCalls.Clear()
    $failure = $null
    try {
        & $script -Repository spatialanalyzer/fixture -Title 'Briosa Fixture 1.2.3' @Parameters 6>$null | Out-Null
    }
    catch { $failure = $_.Exception.Message }
    $summary = if (Test-Path -LiteralPath $env:GITHUB_STEP_SUMMARY) { [IO.File]::ReadAllText($env:GITHUB_STEP_SUMMARY) } else { '' }
    [pscustomobject]@{ Failure = $failure; Summary = $summary; Calls = @($global:BriosaDraftCalls) }
}

function Set-State($Releases = @(), [hashtable]$Tags = @{}, [string]$Fail = '') {
    $global:BriosaDraftReleases = @($Releases)
    $global:BriosaDraftTags = $Tags
    $global:BriosaDraftFail = $Fail
}

function Assert-Created([string]$Name, $Result) {
    if ($Result.Failure) { throw "$Name failed: $($Result.Failure)" }
    $create = @($Result.Calls | Where-Object { $_ -like 'release create *' })
    if ($create.Count -ne 1 -or $create[0] -notmatch "^release create v1\.2\.3 --repo spatialanalyzer/fixture --draft --target $commit --generate-notes --title Briosa Fixture 1\.2\.3$") {
        throw "$Name did not create exactly one draft for the run's commit: $($create -join ' | ')"
    }
}

function Assert-Reused([string]$Name, $Result) {
    if ($Result.Failure) { throw "$Name failed: $($Result.Failure)" }
    if (@($Result.Calls | Where-Object { $_ -like 'release create *' }).Count -ne 0) { throw "$Name created another draft." }
    if ($Result.Summary -notmatch 'Reusing the draft release v1\.2\.3') { throw "$Name did not report the reused draft." }
}

function Assert-Rejected([string]$Name, $Result, [string]$Pattern) {
    if ($null -eq $Result.Failure) { throw "$Name was accepted; expected '$Pattern'." }
    if ($Result.Failure -notmatch $Pattern) { throw "$Name failed with '$($Result.Failure)', expected '$Pattern'." }
    if (@($Result.Calls | Where-Object { $_ -like 'release create *' }).Count -ne 0) { throw "$Name created a draft before failing." }
}

$draft = { param($Target) [pscustomobject]@{ tag_name = 'v1.2.3'; draft = $true; target_commitish = $Target; html_url = 'https://github.com/x/draft' } }
$lightweight = { param($Sha) @{ Type = 'commit'; Sha = $Sha; Commit = $Sha } }
$run = @{ Version = '1.2.3'; Commit = $commit }

try {
    $null = New-Item -ItemType Directory -Path $root

    Set-State
    $result = Invoke-Draft $run
    Assert-Created 'new draft' $result
    if ($result.Summary -notmatch 'before any registry write' -or $result.Summary -notmatch [regex]::Escape($commit)) {
        throw 'The new-draft summary does not explain that the draft precedes publishing for this commit.'
    }
    if (@($result.Calls | Where-Object { $_ -like 'api repos/spatialanalyzer/fixture/releases --paginate*' }).Count -ne 1) {
        throw 'The script must list every release, drafts included, before creating one.'
    }

    Set-State -Releases @([pscustomobject]@{ tag_name = 'v1.2.30'; draft = $false; target_commitish = $other; html_url = 'x' }) -Tags @{ 'v1.2.30' = (& $lightweight $other) }
    Assert-Created 'similar tag names' (Invoke-Draft $run)

    Set-State -Tags @{ 'v1.2.3' = (& $lightweight $commit) }
    Assert-Created 'tag pushed at the commit before the draft' (Invoke-Draft $run)

    Set-State -Releases @(& $draft $commit)
    Assert-Reused 'draft created earlier for this commit' (Invoke-Draft $run)

    Set-State -Releases @(& $draft 'main') -Tags @{ 'v1.2.3' = (& $lightweight $commit) }
    Assert-Reused 'maintainer draft on a tag at this commit' (Invoke-Draft $run)

    Set-State -Releases @(& $draft 'main') -Tags @{ 'v1.2.3' = @{ Type = 'tag'; Sha = '3333333333333333333333333333333333333333'; Commit = $commit } }
    Assert-Reused 'maintainer draft on an annotated tag at this commit' (Invoke-Draft $run)

    Set-State -Releases @([pscustomobject]@{ tag_name = 'v1.2.3'; draft = $false; target_commitish = $commit; html_url = 'x' })
    Assert-Rejected 'published release' (Invoke-Draft $run) 'v1\.2\.3 is already published'

    Set-State -Releases @(& $draft $other)
    Assert-Rejected 'draft for another commit' (Invoke-Draft $run) 'draft release for v1\.2\.3 already exists for another commit'

    Set-State -Releases @(& $draft 'main') -Tags @{ 'v1.2.3' = (& $lightweight $other) }
    Assert-Rejected 'maintainer draft on a tag elsewhere' (Invoke-Draft $run) 'Tag v1\.2\.3 points to 2{40}'

    Set-State -Tags @{ 'v1.2.3' = (& $lightweight $other) }
    Assert-Rejected 'tag elsewhere' (Invoke-Draft $run) 'Tag v1\.2\.3 points to 2{40}'

    Set-State -Releases @((& $draft $commit), (& $draft $commit))
    Assert-Rejected 'duplicate drafts' (Invoke-Draft $run) 'More than one release uses v1\.2\.3'

    Set-State -Fail 'list'
    Assert-Rejected 'release list failure' (Invoke-Draft $run) 'Could not list'

    Set-State -Fail 'tags'
    Assert-Rejected 'tag lookup failure' (Invoke-Draft $run) 'Could not look up'

    Assert-Rejected 'branch-like version' (Invoke-Draft @{ Version = 'main'; Commit = $commit }) 'not a release version'
    Assert-Rejected 'short commit' (Invoke-Draft @{ Version = '1.2.3'; Commit = '1111111' }) 'not a full commit SHA'

    Set-State -Fail 'create'
    $result = Invoke-Draft $run
    if ($null -eq $result.Failure -or $result.Failure -notmatch 'could not create the draft release') { throw "Refused creation did not fail clearly: $($result.Failure)" }
    foreach ($fragment in @(
            'Nothing was published',
            "git push git@github.com:spatialanalyzer/fixture.git ${commit}:refs/tags/v1.2.3",
            'Re-run failed jobs',
            'reuses a draft whose tag points at this commit')) {
        if (-not $result.Summary.Contains($fragment)) { throw "The recovery summary is missing '$fragment'." }
    }

    Write-Host 'Draft release creation, reuse for the same commit, rejection of other commits, and the maintainer recovery passed.'
    # The fake's failure cases leave LASTEXITCODE at 1, which an Actions pwsh step exits with.
    $global:LASTEXITCODE = 0
}
finally {
    $env:GITHUB_STEP_SUMMARY = $savedSummary
    Remove-Item Function:\gh -ErrorAction SilentlyContinue
    $resolvedRoot = [IO.Path]::GetFullPath($root)
    if ($resolvedRoot.StartsWith($temporaryBase, [StringComparison]::OrdinalIgnoreCase) -and (Test-Path -LiteralPath $resolvedRoot)) {
        Remove-Item -LiteralPath $resolvedRoot -Recurse -Force
    }
}
