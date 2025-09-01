# ===============================
# Fix Supabase Imports (Safe, Non-destructive)
# ===============================

Write-Host "🔄 Scanning project for inline Supabase client creations..."

# Find all .ts and .tsx files except node_modules and lib
$files = Get-ChildItem -Recurse -Include *.ts,*.tsx | Where-Object {
    -not ($_.FullName -like "*node_modules*") -and
    -not ($_.FullName -like "*lib\supabase*")
}

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $updated = $false

    if ($content -match "createClient\(") {
        if ($file.FullName -match "app\\api") {
            # API files → supabaseServer
            if ($content -notmatch "supabaseServer") {
                $content = "import { supabaseServer } from '@/lib/supabaseServer';`n" + $content
                $updated = $true
            }
            $content = $content -replace "createClient\(.*?\)", "supabaseServer"
        }
        else {
            # Client/UI files → supabase
            if ($content -notmatch "supabase") {
                $content = "import { supabase } from '@/lib/supabaseClient';`n" + $content
                $updated = $true
            }
            $content = $content -replace "createClient\(.*?\)", "supabase"
        }

        if ($updated) {
            Set-Content $file.FullName $content -Encoding UTF8
            Write-Host "✏️ Updated imports in: $($file.FullName)"
        }
    }
}

Write-Host "`n✅ Done! Open GitHub Desktop, review changes, and commit manually."
