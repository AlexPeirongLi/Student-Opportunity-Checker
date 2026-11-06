Set-Location $PSScriptRoot
$logFile = Join-Path $PSScriptRoot "weekly-check.log"
function Write-Log($text) {
    $time = Get-Date -Format "yyyy-MM-dd HH:mm"
    Add-Content -Path $logFile -Value "$time  $text"
}
node is-check-due.js
if ($LASTEXITCODE -ne 0) {
    exit
}
Write-Log "Check is due, starting"
docker info *> $null
$dockerWasRunning = ($LASTEXITCODE -eq 0)
if (-not $dockerWasRunning) {
    Write-Log "Starting Docker"
    docker desktop start --timeout 300
}
docker start opportunity-mysql *> $null
for ($i = 0; $i -lt 60; $i++) {
    docker exec opportunity-mysql mysqladmin -uroot -ppassword ping *> $null
    if ($LASTEXITCODE -eq 0) {
        break
    }
    Start-Sleep -Seconds 5
}
for ($attempt = 1; $attempt -le 4; $attempt++) {
    $output = node weekly-check.js 2>&1
    $worked = ($LASTEXITCODE -eq 0)
    foreach ($line in $output) {
        Write-Log "$line"
    }
    if ($worked) {
        break
    }
    Write-Log "Attempt $attempt failed, trying again in 15 minutes"
    Start-Sleep -Seconds 900
}
if (-not $dockerWasRunning) {
    Write-Log "Stopping Docker"
    docker desktop stop
}
Write-Log "Finished"
