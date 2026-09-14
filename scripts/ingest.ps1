# Snapshot official LTL pages into data/raw/
$urls = @{
  "pass-info.md" = "https://r.jina.ai/https://louderthanlifefestival.com/pass-info/"
  "passes.md" = "https://r.jina.ai/https://louderthanlifefestival.com/passes/"
  "parking-info.md" = "https://r.jina.ai/https://louderthanlifefestival.com/parking-info/"
  "festival-info.md" = "https://r.jina.ai/https://louderthanlifefestival.com/festival-info/"
}

$outDir = Join-Path $PSScriptRoot "..\data\raw"
New-Item -ItemType Directory -Path $outDir -Force | Out-Null

foreach ($entry in $urls.GetEnumerator()) {
  Write-Host "Fetching $($entry.Key)..."
  try {
    Invoke-WebRequest -Uri $entry.Value -OutFile (Join-Path $outDir $entry.Key) -UseBasicParsing
  } catch {
    Write-Warning "Failed: $($entry.Key) - $_"
  }
}

Write-Host "Done. Raw snapshots in $outDir"
