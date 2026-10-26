$path = "C:\Users\manis\Downloads\SafeFile-Key.pem"
$acl = Get-Acl -Path $path
$acl.SetAccessRuleProtection($true, $false)
$accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule($env:USERNAME, "FullControl", "Allow")
$acl.SetAccessRule($accessRule)
Set-Acl -Path $path -AclObject $acl
