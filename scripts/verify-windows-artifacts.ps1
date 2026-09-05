[CmdletBinding()]
param(
  [string]$ArtifactDirectory = "release",
  [switch]$RequireSignature,
  [string]$ExpectedPublisher = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$artifactRoot = [System.IO.Path]::GetFullPath((Join-Path $root $ArtifactDirectory))

if (-not (Test-Path -LiteralPath $artifactRoot -PathType Container)) {
  throw "Windows artifact directory not found: $artifactRoot"
}

$installers = @(Get-ChildItem -LiteralPath $artifactRoot -File -Filter "Parlyn-Engine-Setup-*.exe")
if ($installers.Count -ne 1) {
  throw "Expected exactly one Parlyn NSIS installer, found $($installers.Count)."
}

$unpackedRoot = Join-Path $artifactRoot "win-unpacked"
$mainExecutable = Join-Path $unpackedRoot "Parlyn Engine.exe"
if (-not (Test-Path -LiteralPath $mainExecutable -PathType Leaf)) {
  throw "Packaged Parlyn executable not found: $mainExecutable"
}

$versionInfo = [System.Diagnostics.FileVersionInfo]::GetVersionInfo($mainExecutable)
if ($versionInfo.ProductName -ne "Parlyn Engine") {
  throw "Unexpected ProductName in packaged executable: $($versionInfo.ProductName)"
}

$executables = @($installers[0]) + @(Get-ChildItem -LiteralPath $unpackedRoot -Recurse -File -Filter "*.exe")

foreach ($file in $executables) {
  $signature = Get-AuthenticodeSignature -LiteralPath $file.FullName
  $hash = Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256
  Write-Host "$($file.Name): signature=$($signature.Status); sha256=$($hash.Hash)"

  if ($RequireSignature -and $signature.Status -ne "Valid") {
    throw "Required valid Authenticode signature is missing from: $($file.FullName)"
  }
}

if ($RequireSignature -and -not [string]::IsNullOrWhiteSpace($ExpectedPublisher)) {
  foreach ($file in @($installers[0].FullName, $mainExecutable)) {
    $signature = Get-AuthenticodeSignature -LiteralPath $file
    $subject = $signature.SignerCertificate.Subject
    if ($subject -notlike "*$ExpectedPublisher*") {
      throw "Unexpected signer for $file. Expected publisher containing '$ExpectedPublisher', got '$subject'."
    }
  }
}

Write-Host "Parlyn Windows artifact verification passed."
