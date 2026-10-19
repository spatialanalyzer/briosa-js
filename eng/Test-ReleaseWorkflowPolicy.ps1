[CmdletBinding()]
param()

# Text checks of .github/workflows/*.yml for the release policy: releases are
# dispatched on main, publishing and the draft GitHub Release run only for main,
# and only those jobs hold write permissions. Jobs and keys are found by
# indentation (two spaces per level), which is how these workflows are written.

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$workflowDirectory = Join-Path $root '.github/workflows'
$failures = [Collections.Generic.List[string]]::new()

function Add-Failure([string]$Message) { $failures.Add($Message) }

function Test-Content([string]$Line) {
    $trimmed = $Line.Trim()
    $trimmed.Length -gt 0 -and -not $trimmed.StartsWith('#')
}

function Get-Indent([string]$Line) { $Line.Length - $Line.TrimStart(' ').Length }

# Returns the mapping keys at exactly $Indent spaces within lines [$Start, $End).
# Each entry spans its own line ($Line) and the deeper lines below it ($Start..$End).
function Get-Entries {
    param([string[]]$Lines, [int]$Start, [int]$End, [int]$Indent)
    $entries = [ordered]@{}
    $current = $null
    for ($i = $Start; $i -lt $End; $i++) {
        $line = $Lines[$i]
        if (-not (Test-Content $line)) { continue }
        $lineIndent = Get-Indent $line
        if ($lineIndent -lt $Indent) {
            break
        }
        if ($lineIndent -eq $Indent -and $line -match "^ {$Indent}(['`"]?)([A-Za-z0-9_.-]+)\1:(?:\s+(.*?))?\s*$") {
            if ($null -ne $current) { $current.End = $i }
            $value = if ($null -ne $Matches[3]) { ($Matches[3] -replace '\s+#.*$', '').Trim() } else { '' }
            $current = [pscustomobject]@{ Name = $Matches[2]; Value = $value; Line = $i; Start = $i + 1; End = $End }
            $entries[$current.Name] = $current
        }
    }
    if ($null -ne $current -and $i -lt $current.End) { $current.End = $i }
    $entries
}

function Get-Text([string[]]$Lines, $Entry) {
    if ($null -eq $Entry) { return '' }
    ($Lines[$Entry.Line..($Entry.End - 1)] -join "`n")
}

function Get-ListValue([string[]]$Lines, $Entry) {
    if ($null -eq $Entry) { return @() }
    if ($Entry.Value) {
        return @($Entry.Value.Trim('[', ']', ' ').Split(',') | ForEach-Object { $_.Trim(' ', "'", '"') } | Where-Object { $_ })
    }
    if ($Entry.End -le $Entry.Start) { return @() }
    @($Lines[$Entry.Start..($Entry.End - 1)] | Where-Object { $_ -match '^\s+-\s+(\S+)' } | ForEach-Object { $_ -replace '^\s+-\s+', '' -replace '\s+#.*$', '' })
}

function Find-Job($Jobs, [int]$LineIndex) {
    foreach ($job in $Jobs.Values) {
        if ($LineIndex -ge $job.Line -and $LineIndex -lt $job.End) { return $job }
    }
    $null
}

$workflowFiles = @(Get-ChildItem -LiteralPath $workflowDirectory -File | Where-Object { $_.Extension -in '.yml', '.yaml' } | Sort-Object Name)
if (-not ($workflowFiles.Name -contains 'release.yml')) { throw 'Missing .github/workflows/release.yml.' }

foreach ($file in $workflowFiles) {
    $lines = [string[]](Get-Content -LiteralPath $file.FullName)
    $name = $file.Name
    $top = Get-Entries $lines 0 $lines.Count 0
    $on = $top['on']
    if ($null -eq $on) {
        Add-Failure "${name}: has no top-level 'on:' block."
        continue
    }
    $jobs = if ($top.Contains('jobs')) { Get-Entries $lines $top['jobs'].Start $top['jobs'].End 2 } else { [ordered]@{} }

    # No workflow may run for tag pushes or tag creation.
    if ($on.Value) {
        $events = @($on.Value.Trim('[', ']', ' ').Split(',') | ForEach-Object { $_.Trim() } | Where-Object { $_ })
        $eventEntries = [ordered]@{}
    } else {
        $eventEntries = Get-Entries $lines $on.Start $on.End 2
        $events = @($eventEntries.Keys)
    }
    if ($events -contains 'create') { Add-Failure "${name}: the 'create' trigger runs for new tags." }
    for ($index = $on.Start; $index -lt $on.End; $index++) {
        if ($lines[$index] -match '^\s+tags(-ignore)?\s*:') {
            Add-Failure "${name}:$($index + 1): triggers on tag pushes."
        }
    }
    if ($events -contains 'push') {
        $push = if ($eventEntries.Contains('push')) { $eventEntries['push'] } else { $null }
        $filters = if ($null -ne $push -and -not $push.Value) { Get-Entries $lines $push.Start $push.End 4 } else { [ordered]@{} }
        if (-not ($filters.Contains('branches') -or $filters.Contains('branches-ignore'))) {
            Add-Failure "${name}: a push trigger without a branch filter also runs for tag pushes."
        }
    }

    # Inputs reach run: scripts through env:, never by expression interpolation.
    for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -notmatch '^(\s*)(-\s+)?run:') { continue }
        $keyIndent = $Matches[1].Length + $(if ($Matches[2]) { $Matches[2].Length } else { 0 })
        $j = $i
        do {
            if ($lines[$j] -match '\$\{\{\s*(github\.event\.)?inputs\.') {
                Add-Failure "${name}:$($j + 1): interpolates a workflow input into a run: script; pass it through env:."
            }
            $j++
        } while ($j -lt $lines.Count -and (-not (Test-Content $lines[$j]) -or (Get-Indent $lines[$j]) -gt $keyIndent))
    }

    # Write permissions: id-token only for publishing, contents only for the draft release.
    for ($i = 0; $i -lt $lines.Count; $i++) {
        $line = $lines[$i]
        if ($line -match '^\s*permissions\s*:\s*write-all') {
            Add-Failure "${name}:$($i + 1): grants write-all permissions."
        }
        $scope = $null
        if ($line -match '^\s*id-token\s*:\s*write\b') { $scope = 'id-token'; $allowedJob = 'publish' }
        elseif ($line -match '^\s*contents\s*:\s*write\b') { $scope = 'contents'; $allowedJob = 'release' }
        if ($null -eq $scope) { continue }
        $job = Find-Job $jobs $i
        if ($name -ne 'release.yml' -or $null -eq $job -or $job.Name -ne $allowedJob) {
            Add-Failure "${name}:$($i + 1): '${scope}: write' is allowed only in the release.yml $allowedJob job."
        }
    }

    if ($name -ne 'release.yml') { continue }

    # release.yml is dispatched with a version and a publish switch, nothing else.
    if ($events.Count -ne 1 -or $events[0] -ne 'workflow_dispatch') {
        Add-Failure "release.yml: 'on:' must contain only workflow_dispatch, found: $($events -join ', ')."
    }
    $dispatch = if ($eventEntries.Contains('workflow_dispatch')) { $eventEntries['workflow_dispatch'] } else { $null }
    $dispatchKeys = if ($null -ne $dispatch) { Get-Entries $lines $dispatch.Start $dispatch.End 4 } else { [ordered]@{} }
    $inputs = if ($dispatchKeys.Contains('inputs')) { Get-Entries $lines $dispatchKeys['inputs'].Start $dispatchKeys['inputs'].End 6 } else { [ordered]@{} }
    $inputNames = @($inputs.Keys | Sort-Object)
    if (($inputNames -join ',') -ne 'publish,version') {
        Add-Failure "release.yml: workflow_dispatch inputs must be exactly 'version' and 'publish', found: $($inputNames -join ', ')."
    } else {
        $versionInput = Get-Entries $lines $inputs['version'].Start $inputs['version'].End 8
        $publishInput = Get-Entries $lines $inputs['publish'].Start $inputs['publish'].End 8
        if (-not ($versionInput.Contains('type') -and $versionInput['type'].Value -eq 'string' -and
                $versionInput.Contains('required') -and $versionInput['required'].Value -eq 'true')) {
            Add-Failure "release.yml: input 'version' must be a required string."
        }
        if (-not ($publishInput.Contains('type') -and $publishInput['type'].Value -eq 'boolean' -and
                $publishInput.Contains('required') -and $publishInput['required'].Value -eq 'true' -and
                $publishInput.Contains('default') -and $publishInput['default'].Value -eq 'false')) {
            Add-Failure "release.yml: input 'publish' must be a required boolean that defaults to false."
        }
    }

    foreach ($required in 'validate', 'build', 'publish', 'release') {
        if (-not $jobs.Contains($required)) { Add-Failure "release.yml: missing job '$required'." }
    }

    if ($jobs.Contains('validate')) {
        $validateText = Get-Text $lines $jobs['validate']
        foreach ($fragment in 'fetch-depth: 0', 'persist-credentials: false', './eng/Test-ReleaseVersion.ps1',
            '-Version $env:RELEASE_VERSION', '-Ref $env:GITHUB_REF', '-Commit $env:GITHUB_SHA', '-Publish', '${{ inputs.version }}') {
            if (-not $validateText.Contains($fragment)) {
                Add-Failure "release.yml: the validate job must contain '$fragment'."
            }
        }
    }

    foreach ($jobName in 'publish', 'release') {
        if (-not $jobs.Contains($jobName)) { continue }
        $job = $jobs[$jobName]
        $keys = Get-Entries $lines $job.Start $job.End 4
        $condition = if ($keys.Contains('if')) { $keys['if'].Value } else { '' }
        if (-not ($condition.Contains('inputs.publish') -and $condition.Contains("github.ref == 'refs/heads/main'"))) {
            Add-Failure "release.yml: the $jobName job's if: must require inputs.publish and github.ref == 'refs/heads/main', found: '$condition'."
        }
        if ((Get-Text $lines $job).Contains('refs/tags')) {
            Add-Failure "release.yml: the $jobName job must not refer to refs/tags."
        }
        $needs = Get-ListValue $lines $(if ($keys.Contains('needs')) { $keys['needs'] } else { $null })
        $requiredNeeds = if ($jobName -eq 'publish') { 'validate', 'build' } else { 'validate', 'publish' }
        foreach ($need in $requiredNeeds) {
            if ($needs -notcontains $need) { Add-Failure "release.yml: the $jobName job must need $need." }
        }

        if ($jobName -eq 'publish') {
            $environment = if ($keys.Contains('environment')) { $keys['environment'].Value } else { '' }
            if ($environment -eq '${{ matrix.environment }}') {
                $matrixEnvironments = @($lines[$job.Start..($job.End - 1)] |
                    Where-Object { $_ -match '^\s+-?\s*environment:\s*\S' -and $_ -notmatch '\$\{\{' })
                if ($matrixEnvironments.Count -eq 0) {
                    Add-Failure 'release.yml: the publish job uses ${{ matrix.environment }} without matrix environment names.'
                }
            } elseif ($environment -notmatch '^[A-Za-z0-9_.-]+$') {
                Add-Failure "release.yml: the publish job must deploy to a named registry environment, found: '$environment'."
            }
        } else {
            $releaseText = Get-Text $lines $job
            $create = @($releaseText -split "`n" | Where-Object { $_ -match 'gh release create' })
            if ($create.Count -ne 1 -or -not ($create[0].Contains('--draft') -and $create[0].Contains('--target'))) {
                Add-Failure 'release.yml: the release job must run gh release create with --draft and --target.'
            }
            if (-not ($releaseText -match 'gh api [^\n]*/releases"? [^\n]*--paginate') -or $releaseText.Contains('releases/tags/')) {
                Add-Failure 'release.yml: the release job must check all releases, drafts included (releases/tags/<tag> hides drafts).'
            }
        }
    }
}

if ($failures.Count -gt 0) {
    $failures | ForEach-Object { Write-Host "  FAIL  $_" }
    throw "$($failures.Count) release workflow policy check(s) failed."
}
Write-Host "Release workflow policy holds for $($workflowFiles.Count) workflow file(s)."
