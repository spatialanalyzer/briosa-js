[CmdletBinding()]
param(
    [Parameter(Mandatory)][string]$Version,
    [Parameter(Mandatory)][string]$Commit,
    [Parameter(Mandatory)][string]$Title,
    [string]$Repository = $env:GITHUB_REPOSITORY
)

# Creates the draft GitHub Release for a release run before any registry write, or
# reuses a draft that already belongs to the run's commit. Publishing the draft
# creates the v<version> tag.
# GitHub refuses release creation by the workflow token when the target commit's
# workflow files differ from main, for example after a workflow change merges while
# the run waits for approval. Nothing is published at that point, and the summary
# gives the maintainer's recovery, which keeps this run's commit and packages.

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

if ($Version -cnotmatch '^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$') {
    throw "'$Version' is not a release version (MAJOR.MINOR.PATCH)."
}
if ($Commit -cnotmatch '^[0-9a-f]{40}$') { throw "'$Commit' is not a full commit SHA." }
if ($Repository -cnotmatch '^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$') { throw "'$Repository' is not an owner/name repository." }
$tag = "v$Version"

function Write-Summary([string[]]$Lines) {
    $text = ($Lines -join "`n") + "`n"
    if ($env:GITHUB_STEP_SUMMARY) { $text | Out-File -FilePath $env:GITHUB_STEP_SUMMARY -Append }
    Write-Host $text
}

# The tag, if it exists, decides where publishing the draft puts the release.
$refs = @(gh api "repos/$Repository/git/matching-refs/tags/$tag" --jq '.[] | {ref, type: .object.type, sha: .object.sha} | tojson')
if ($LASTEXITCODE -ne 0) { throw "Could not look up tag $tag." }
$tagCommit = $null
foreach ($ref in @($refs | ForEach-Object { $_ | ConvertFrom-Json } | Where-Object ref -ceq "refs/tags/$tag")) {
    $tagCommit = $ref.sha
    if ($ref.type -ceq 'tag') {
        $tagCommit = @(gh api "repos/$Repository/git/tags/$($ref.sha)" --jq '.object.sha')[0]
        if ($LASTEXITCODE -ne 0) { throw "Could not look up annotated tag $tag." }
    }
}
if ($tagCommit -and $tagCommit -cne $Commit) {
    throw "Tag $tag points to $tagCommit, not this run's commit $Commit."
}

# The release-by-tag endpoint omits drafts, so list every release.
$releases = @(gh api "repos/$Repository/releases" --paginate --jq '.[] | {tag_name, draft, target_commitish, html_url} | tojson')
if ($LASTEXITCODE -ne 0) { throw 'Could not list existing releases.' }
$existing = @($releases | ForEach-Object { $_ | ConvertFrom-Json } | Where-Object tag_name -ceq $tag)
if ($existing.Count -gt 1) { throw "More than one release uses $tag; keep one draft and delete the others." }
if ($existing.Count -eq 1) {
    $release = $existing[0]
    if (-not $release.draft) { throw "$tag is already published: $($release.html_url)" }
    if ($release.target_commitish -cne $Commit -and $tagCommit -cne $Commit) {
        throw "A draft release for $tag already exists for another commit ($($release.target_commitish)): $($release.html_url). Delete it, or push $tag at $Commit, before rerunning."
    }
    Write-Summary @(
        "## Draft release $tag",
        '',
        "Reusing the draft release $tag for ``$Commit``: $($release.html_url)")
    return
}

$url = gh release create $tag --repo $Repository --draft --target $Commit --generate-notes --title $Title
if ($LASTEXITCODE -ne 0) {
    Write-Summary @(
        "## Draft release $tag was refused",
        '',
        "GitHub would not let the workflow token create the draft release for ``$Commit``. This happens when that commit's workflow files differ from main, for example after a workflow change merged while this run waited. Nothing was published to the registry.",
        '',
        'To release this commit as approved, the maintainer:',
        '',
        "1. Pushes the tag at this commit with their own credentials over SSH: ``git push git@github.com:$Repository.git ${Commit}:refs/tags/$tag``.",
        '2. Uses **Re-run failed jobs** on this run. With the tag in place GitHub creates no tag, so the draft and publishing continue from the same commit and packages.',
        "3. If the draft is still refused, creates it on the Releases page from the existing tag $tag (title ``$Title``, saved as a draft), then uses **Re-run failed jobs** again. The job reuses a draft whose tag points at this commit.")
    throw "The workflow token could not create the draft release for $tag; see the job summary for the recovery."
}

Write-Summary @(
    "## Draft release $tag",
    '',
    "Created the draft release for ``$Commit`` before any registry write: $url",
    '',
    'After both packages publish, the maintainer verifies them in a clean consumer, completes the notes, and publishes the draft, which creates the tag at that commit.')
