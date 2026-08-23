$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("C:\Users\MAYUR\Desktop\CRYPTOSP.lnk")
$Shortcut.TargetPath = "c:\Users\MAYUR\Downloads\CRYPTOSP\Run-CRYPTOSP.bat"
$Shortcut.WorkingDirectory = "c:\Users\MAYUR\Downloads\CRYPTOSP"
$Shortcut.Description = "Launch CRYPTOSP Digital Wallet Platform"
$Shortcut.Save()
Write-Host "Desktop Shortcut Created Successfully!"
