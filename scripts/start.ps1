Write-Host "🎮 Connect4 - Iniciando Proyecto" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Verificar si Node.js está instalado
try {
    $null = Get-Command "node" -ErrorAction Stop
    Write-Host "✅ Node.js encontrado" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js no está instalado" -ForegroundColor Red
    exit 1
}

# Verificar si las dependencias están instaladas
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependencias..." -ForegroundColor Yellow
    npm install
} else {
    Write-Host "✅ Dependencias ya instaladas" -ForegroundColor Green
}

# Generar cliente Prisma
Write-Host "🔄 Generando cliente Prisma..." -ForegroundColor Cyan
npx prisma generate

# Verificar conexión a la base de datos
Write-Host "🔍 Verificando conexión a la base de datos..." -ForegroundColor Cyan
node tests/test-db-connection.js

# Verificar resultado y continuar
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Base de datos conectada" -ForegroundColor Green
    Write-Host "🚀 Iniciando servidor..." -ForegroundColor Green
    npm run dev
} else {
    Write-Host "❌ Error de conexión a la base de datos" -ForegroundColor Red
    Write-Host "   Revisa tu archivo .env y configuración de SQL Server" -ForegroundColor Yellow
    Write-Host "   También puedes iniciar directamente con: npm run dev" -ForegroundColor Cyan
} 