[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [string]$ProtocolArtifactPath,

    [Parameter(Mandatory)]
    [string]$BriosaRepository,

    [string]$Configuration = "Release",

    [switch]$NoBuild
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if (-not $IsWindows -or -not [Environment]::Is64BitProcess) {
    throw "Packaged Briosa conformance requires 64-bit Windows."
}

$repositoryRoot = Split-Path -Parent $PSScriptRoot
$resolvedArtifact = [IO.Path]::GetFullPath($ProtocolArtifactPath, $repositoryRoot)
$resolvedBriosa = [IO.Path]::GetFullPath($BriosaRepository, $repositoryRoot)
$lock = Get-Content -LiteralPath (Join-Path $repositoryRoot "protocol.lock.json") -Raw | ConvertFrom-Json
$temporaryBase = [IO.Path]::GetFullPath([IO.Path]::GetTempPath())
$temporaryRoot = Join-Path $temporaryBase "briosa-js-conformance-$([Guid]::NewGuid().ToString('N'))"
$smokeWorkerProject = Join-Path $resolvedBriosa "tests\Briosa.SmokeWorker\Briosa.SmokeWorker.csproj"
$smokeWorkerExe = Join-Path $resolvedBriosa "tests\Briosa.SmokeWorker\bin\$Configuration\net10.0-windows\Briosa.SmokeWorker.exe"
$tsxCli = Join-Path $repositoryRoot "node_modules\tsx\dist\cli.mjs"
$conformanceClient = Join-Path $repositoryRoot "tools\conformance.ts"

function Invoke-Checked {
    param(
        [Parameter(Mandatory)][string]$FilePath,
        [Parameter(Mandatory)][string[]]$Arguments,
        [Parameter(Mandatory)][string]$Failure
    )

    & $FilePath @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw $Failure
    }
}

function Get-AvailablePort {
    $listener = [Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback, 0)
    try {
        $listener.Start()
        return ([Net.IPEndPoint]$listener.LocalEndpoint).Port
    }
    finally {
        $listener.Stop()
    }
}

function Wait-ForListener {
    param(
        [Parameter(Mandatory)][Diagnostics.Process]$Process,
        [Parameter(Mandatory)][int]$Port
    )

    $deadline = [DateTimeOffset]::UtcNow.AddSeconds(30)
    while ([DateTimeOffset]::UtcNow -lt $deadline) {
        if ($Process.HasExited) {
            return $false
        }

        $client = [Net.Sockets.TcpClient]::new()
        try {
            $task = $client.ConnectAsync([Net.IPAddress]::Loopback, $Port)
            if ($task.Wait(250) -and $client.Connected) {
                return $true
            }
        }
        catch {
        }
        finally {
            $client.Dispose()
        }

        Start-Sleep -Milliseconds 100
    }

    return $false
}

function Start-ScenarioServer {
    param(
        [Parameter(Mandatory)][string]$ServerExecutable,
        [Parameter(Mandatory)][string]$WorkingDirectory,
        [Parameter(Mandatory)][string]$WorkerScenario,
        [Parameter(Mandatory)][string]$StatePath,
        [Parameter(Mandatory)][int]$Port,
        [Parameter(Mandatory)][string]$StandardOutput,
        [Parameter(Mandatory)][string]$StandardError,
        [AllowNull()][string]$WatchdogTimeout,
        [bool]$DenyOperation
    )

    $environmentValues = [ordered]@{
        "Briosa__Worker__ExecutablePath" = $smokeWorkerExe
        "BRIOSA_TEST_WORKER_SCENARIO" = $WorkerScenario
        "BRIOSA_TEST_WORKER_STATE_PATH" = $StatePath
        "Briosa__Worker__ExecutionWatchdogTimeout" = $WatchdogTimeout
        "Briosa__Security__Operations__Deny__0" = $(if ($DenyOperation) { "file_operations.get_working_directory" } else { $null })
    }
    $previousValues = [ordered]@{}
    foreach ($entry in $environmentValues.GetEnumerator()) {
        $previousValues[$entry.Key] = [Environment]::GetEnvironmentVariable($entry.Key)
        if ($null -eq $entry.Value) {
            Remove-Item -LiteralPath "Env:$($entry.Key)" -ErrorAction SilentlyContinue
        }
        else {
            [Environment]::SetEnvironmentVariable($entry.Key, $entry.Value)
        }
    }

    try {
        return Start-Process `
            -FilePath $ServerExecutable `
            -ArgumentList @("--Briosa:Endpoint:Port=$Port") `
            -WorkingDirectory $WorkingDirectory `
            -WindowStyle Hidden `
            -RedirectStandardOutput $StandardOutput `
            -RedirectStandardError $StandardError `
            -PassThru
    }
    finally {
        foreach ($entry in $previousValues.GetEnumerator()) {
            if ($null -eq $entry.Value) {
                Remove-Item -LiteralPath "Env:$($entry.Key)" -ErrorAction SilentlyContinue
            }
            else {
                [Environment]::SetEnvironmentVariable($entry.Key, $entry.Value)
            }
        }
    }
}

if (-not (Test-Path -LiteralPath $resolvedArtifact -PathType Leaf)) {
    throw "The protocol artifact does not exist."
}
if (-not (Test-Path -LiteralPath (Join-Path $resolvedBriosa "Briosa.slnx") -PathType Leaf)) {
    throw "The Briosa source repository is invalid."
}
$briosaRevision = (& git -C $resolvedBriosa rev-parse HEAD).Trim()
if ($LASTEXITCODE -ne 0 -or $briosaRevision -ne $lock.artifact.source_revision) {
    throw "The Briosa source checkout does not match protocol.lock.json."
}

[IO.Directory]::CreateDirectory($temporaryRoot) | Out-Null
try {
    Invoke-Checked -FilePath "node" -Arguments @(
        (Join-Path $PSScriptRoot "import-protocol-artifact.mjs"),
        "--artifact",
        $resolvedArtifact
    ) -Failure "Protocol identity or generated-code drift verification failed."

    $artifactExtract = Join-Path $temporaryRoot "protocol"
    Expand-Archive -LiteralPath $resolvedArtifact -DestinationPath $artifactExtract
    $bundleDirectories = @(Get-ChildItem -LiteralPath $artifactExtract -Directory)
    if ($bundleDirectories.Count -ne 1) {
        throw "The protocol artifact must contain one top-level directory."
    }
    $fixtureRoot = Join-Path $bundleDirectories[0].FullName "conformance\v1"
    $liveFixture = Join-Path $fixtureRoot "live-scenarios.json"
    $errorFixture = Join-Path $fixtureRoot "operation-error-cases.json"

    if (-not $NoBuild) {
        Invoke-Checked -FilePath "npm" -Arguments @("ci") -Failure "Locked npm install failed."
        Invoke-Checked -FilePath "npm" -Arguments @("run", "build") -Failure "JavaScript client build failed."
        Invoke-Checked -FilePath "dotnet" -Arguments @("restore", $smokeWorkerProject, "--locked-mode") -Failure "Smoke-worker restore failed."
        Invoke-Checked -FilePath "dotnet" -Arguments @("build", $smokeWorkerProject, "-c", $Configuration, "--no-restore") -Failure "Smoke-worker build failed."
    }
    if (-not (Test-Path -LiteralPath $tsxCli -PathType Leaf) -or
        -not (Test-Path -LiteralPath $smokeWorkerExe -PathType Leaf)) {
        throw "The JavaScript conformance client and Briosa smoke worker must be built."
    }

    Invoke-Checked -FilePath "node" -Arguments @($tsxCli, $conformanceClient, "--error-fixture", $errorFixture) -Failure "Typed-error conformance failed."

    $packageOutput = Join-Path $temporaryRoot "server-output"
    $packageScript = Join-Path $resolvedBriosa "eng\New-WindowsPackage.ps1"
    & $packageScript -Version $lock.artifact.briosa_version -SourceRevision $lock.artifact.source_revision -OutputDirectory $packageOutput
    if ($LASTEXITCODE -ne 0) {
        throw "Briosa package creation failed."
    }
    $packageName = "briosa-$($lock.artifact.briosa_version)-sa-$($lock.catalog.spatial_analyzer_target)-win-x64.zip"
    $packagePath = Join-Path $packageOutput $packageName
    $packageExtract = Join-Path $temporaryRoot "server"
    Expand-Archive -LiteralPath $packagePath -DestinationPath $packageExtract
    $packageDirectories = @(Get-ChildItem -LiteralPath $packageExtract -Directory)
    if ($packageDirectories.Count -ne 1) {
        throw "The server package must contain one top-level directory."
    }
    $packageRoot = $packageDirectories[0].FullName
    $serverExecutable = Join-Path $packageRoot "Briosa.Server.exe"

    $live = Get-Content -LiteralPath $liveFixture -Raw | ConvertFrom-Json
    foreach ($scenario in $live.scenarios) {
        $serverProcess = $null
        $beforeWorkers = @(
            Get-Process -Name "Briosa.SmokeWorker" -ErrorAction SilentlyContinue |
                Select-Object -ExpandProperty Id)
        $scenarioRoot = Join-Path $temporaryRoot $scenario.id
        [IO.Directory]::CreateDirectory($scenarioRoot) | Out-Null
        $port = Get-AvailablePort
        try {
            $serverProcess = Start-ScenarioServer -ServerExecutable $serverExecutable -WorkingDirectory $packageRoot -WorkerScenario $scenario.worker_scenario -StatePath (Join-Path $scenarioRoot "worker-state") -Port $port -StandardOutput (Join-Path $scenarioRoot "server.stdout.log") -StandardError (Join-Path $scenarioRoot "server.stderr.log") -WatchdogTimeout $scenario.watchdog_timeout -DenyOperation $scenario.deny_operation
            if (-not (Wait-ForListener -Process $serverProcess -Port $port)) {
                throw "The server did not listen for scenario '$($scenario.id)'."
            }

            Invoke-Checked -FilePath "node" -Arguments @($tsxCli, $conformanceClient, "--address", "127.0.0.1:$port", "--scenario", $scenario.id, "--fixture", $liveFixture) -Failure "Client conformance failed for '$($scenario.id)'."
            Write-Host "Passed JavaScript client scenario: $($scenario.id)"
        }
        finally {
            if ($null -ne $serverProcess -and -not $serverProcess.HasExited) {
                Stop-Process -Id $serverProcess.Id -Force
                $serverProcess.WaitForExit()
            }

            Start-Sleep -Milliseconds 500
            $newWorkers = @(
                Get-Process -Name "Briosa.SmokeWorker" -ErrorAction SilentlyContinue |
                    Where-Object { $_.Id -notin $beforeWorkers })
            foreach ($worker in $newWorkers) {
                Stop-Process -Id $worker.Id -Force
            }
        }
    }

    Write-Host "All shared JavaScript client conformance cases passed without SpatialAnalyzer."
}
finally {
    $resolvedTemporaryRoot = [IO.Path]::GetFullPath($temporaryRoot)
    if ($resolvedTemporaryRoot.StartsWith(
            $temporaryBase,
            [StringComparison]::OrdinalIgnoreCase) -and
        (Test-Path -LiteralPath $resolvedTemporaryRoot)) {
        Remove-Item -LiteralPath $resolvedTemporaryRoot -Recurse -Force
    }
}
