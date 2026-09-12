[CmdletBinding()]
param(
  [string]$SourceDirectory = "release/win-unpacked",
  [string]$OutputDirectory = "release/msix-test"
)

$ErrorActionPreference = "Stop"
$source = (Resolve-Path -LiteralPath $SourceDirectory).Path
$output = [System.IO.Path]::GetFullPath((Join-Path $PWD $OutputDirectory))
$staging = Join-Path $output "staging"
$package = Join-Path $output "Parlyn-Engine-Development-0.5.0-beta.18-x64.msix"

if (-not (Test-Path -LiteralPath (Join-Path $source "Parlyn Engine.exe"))) {
  throw "The unpacked Parlyn executable was not found."
}

$kitsRoot = Join-Path ([Environment]::GetFolderPath("ProgramFilesX86")) "Windows Kits\10\bin"
$makeAppx = Get-ChildItem -LiteralPath $kitsRoot -Filter MakeAppx.exe -Recurse |
  Where-Object { $_.FullName -match '\\x64\\MakeAppx\.exe$' } |
  Sort-Object FullName -Descending | Select-Object -First 1
if (-not $makeAppx) { throw "MakeAppx.exe was not found in the Windows SDK." }

if (Test-Path -LiteralPath $output) {
  Remove-Item -LiteralPath $output -Recurse -Force
}
New-Item -ItemType Directory -Path $staging | Out-Null
Copy-Item -Path (Join-Path $source "*") -Destination $staging -Recurse
Copy-Item -LiteralPath "build/msix/AppxManifest.xml" -Destination $staging
New-Item -ItemType Directory -Path (Join-Path $staging "Assets") | Out-Null
Copy-Item -Path "build/msix/*.png" -Destination (Join-Path $staging "Assets")

& $makeAppx.FullName pack /d $staging /p $package /o
if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $package)) {
  throw "MakeAppx failed to create the unsigned MSIX package."
}

$hash = Get-FileHash -LiteralPath $package -Algorithm SHA256
"$($hash.Hash.ToLower())  $([System.IO.Path]::GetFileName($package))" |
  Set-Content -LiteralPath (Join-Path $output "SHA256SUMS.txt") -Encoding utf8
Remove-Item -LiteralPath $staging -Recurse -Force
Write-Host "Unsigned MSIX test package created: $package"
