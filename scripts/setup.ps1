#!/usr/bin/env pwsh

Write-Host "🛠️  Connect4 - Configuración Inicial" -ForegroundColor Blue
Write-Host "====================================" -ForegroundColor Blue

# Instalar dependencias
Write-Host "📦 Instalando dependencias de Node.js..." -ForegroundColor Yellow
npm install

# Verificar archivo .env
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  Archivo .env no encontrado" -ForegroundColor Yellow
    Write-Host "📄 Creando plantilla de .env..." -ForegroundColor Cyan
    
    $envTemplate = @"
# Configuración de Base de Datos SQL Server
DATABASE_URL="sqlserver://localhost:1433;database=Connect4DB;integratedSecurity=true;encrypt=true;trustServerCertificate=true"
PORT=3000
NODE_ENV=development
"@
    
    $envTemplate | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✅ Archivo .env creado" -ForegroundColor Green
    Write-Host "   🔧 Edita el archivo .env con tu configuración de SQL Server" -ForegroundColor Yellow
} else {
    Write-Host "✅ Archivo .env encontrado" -ForegroundColor Green
}

# Generar cliente Prisma
Write-Host "🔄 Generando cliente Prisma..." -ForegroundColor Cyan
npx prisma generate

# Ejecutar migraciones
Write-Host "🗄️  Ejecutando migraciones..." -ForegroundColor Cyan
npx prisma migrate dev --name setup

Write-Host "🎉 Configuración completada!" -ForegroundColor Green
Write-Host "   Ejecuta: .\scripts\start.ps1 para iniciar el servidor" -ForegroundColor Cyan 