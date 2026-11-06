$script = Join-Path $PSScriptRoot "weekly-check.ps1"
$action = New-ScheduledTaskAction `
    -Execute "powershell.exe" `
    -Argument "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$script`""
$everyThursday = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Thursday -At "13:00"
$whenYouLogIn = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME
$settings = New-ScheduledTaskSettingsSet `
    -StartWhenAvailable `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -ExecutionTimeLimit (New-TimeSpan -Hours 2)
Register-ScheduledTask `
    -TaskName "Student Opportunity Weekly Check" `
    -Action $action `
    -Trigger $everyThursday, $whenYouLogIn `
    -Settings $settings `
    -Force
