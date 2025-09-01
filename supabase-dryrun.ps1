# supabase-dryrun.ps1 — safe preview only (no writes)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

if (-not (Test-Path './package.json')) {
  Write-Warning "No package.json found. Make sure you're in repo root."
}

Write-Host "`nScanning for createClient usages and SUPABASE_SERVICE_ROLE_KEY..." -ForegroundColor Cyan

Get-ChildItem -Recurse -File -Include *.ts,*.tsx,*.js,*.jsx `
  | Where-Object { $_.FullName -notmatch '\\node_modules\\' -and $_.FullName -notmatch '\\.git\\' } `
  | ForEach-Object {
      $path = $_.FullName
      $content = Get-Content -Raw -LiteralPath $path -ErrorAction SilentlyContinue
      if ($null -ne $content) {
        if ($content -match 'createClient' -or $content -match 'SUPABASE_SERVICE_ROLE_KEY' -or $content -match 'NEXT_PUBLIC_SUPABASE_ANON_KEY') {
          Write-Host "`n---- $path ----" -ForegroundColor Yellow
          # show up to 6 matching context lines
          Select-String -Path $path -Pattern 'createClient|SUPABASE_SERVICE_ROLE_KEY|NEXT_PUBLIC_SUPABASE_ANON_KEY' -SimpleMatch -Context 3 |
            ForEach-Object {
              $p = $_.LineNumber
              "{0}:{1} {2}" -f $_.Path, $_.LineNumber, ($_.Line.Trim())
            } | ForEach-Object { Write-Host $_ }
        }
      }
    }

Write-Host "`nDry-run complete. Review the output and open these files in VS Code or GitHub Desktop." -ForegroundColor Green
