Write-Host "🔄 Regenerando cliente de Prisma..." -ForegroundColor Yellow
Set-Location "c:\progra avanzada web\Connect4"
npx prisma generate

Write-Host ""
Write-Host "⚠️  IMPORTANTE: Antes de continuar, ejecuta el script MigrarBaseDatos.sql en tu SQL Server" -ForegroundColor Red
Write-Host "📁 El archivo está en: c:\progra avanzada web\Connect4\MigrarBaseDatos.sql" -ForegroundColor Yellow
Write-Host ""
Write-Host "Presiona cualquier tecla para continuar una vez hayas ejecutado el script SQL..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host "🚀 Iniciando servidor..." -ForegroundColor Green  
npm run dev
