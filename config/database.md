# Configuración de SQL Server

## Variables de Entorno Requeridas

Crea un archivo `.env` en la raíz del proyecto con la siguiente configuración:

```env
# Configuración de Base de Datos SQL Server
DATABASE_URL="sqlserver://localhost:1433;database=Connect4DB;user=sa;password=TuPassword123!;encrypt=true;trustServerCertificate=true"
PORT=3000
NODE_ENV=development
```

## Ejemplos de Conexión

### 1. SQL Server Express Local (Recomendado para desarrollo)
```env
DATABASE_URL="sqlserver://localhost:1433;database=Connect4DB;user=sa;password=TuPassword123!;encrypt=true;trustServerCertificate=true"
```

### 2. SQL Server con Windows Authentication
```env
DATABASE_URL="sqlserver://localhost:1433;database=Connect4DB;integratedSecurity=true;encrypt=true;trustServerCertificate=true"
```

### 3. SQL Server en Azure
```env
DATABASE_URL="sqlserver://servidor.database.windows.net:1433;database=Connect4DB;user=usuario@servidor;password=contraseña;encrypt=true"
```

### 4. SQL Server con instancia nombrada
```env
DATABASE_URL="sqlserver://localhost:1433;database=Connect4DB;instanceName=SQLEXPRESS;user=sa;password=TuPassword123!;encrypt=true;trustServerCertificate=true"
```

## Instalación de SQL Server

### Opción 1: SQL Server Express (Gratuito)
1. Descargar desde: https://www.microsoft.com/en-us/sql-server/sql-server-downloads
2. Instalar SQL Server Express
3. Configurar usuario `sa` con contraseña
4. Habilitar autenticación mixta (Windows + SQL Server)

### Opción 2: SQL Server Developer Edition (Gratuito)
1. Descargar desde: https://www.microsoft.com/en-us/sql-server/sql-server-downloads
2. Más características que Express
3. Ideal para desarrollo

### Opción 3: Docker (Multiplataforma)
```bash
docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=TuPassword123!" -p 1433:1433 --name sqlserver -d mcr.microsoft.com/mssql/server:2022-latest
```

## Comandos Prisma para SQL Server

```bash
# Generar cliente
npm run db:generate

# Crear y aplicar migración
npm run db:migrate

# Resetear base de datos
npm run db:reset

# Abrir Prisma Studio
npm run db:studio
```

## Configuración de Firewall

Si usas SQL Server local, asegúrate de:
1. Habilitar TCP/IP en SQL Server Configuration Manager
2. Configurar puerto 1433
3. Reiniciar servicio SQL Server
4. Permitir conexiones en Windows Firewall

## Notas Importantes

- **Seguridad**: Nunca subas el archivo `.env` al repositorio
- **Contraseñas**: Usa contraseñas seguras (mínimo 8 caracteres, mayúsculas, minúsculas, números y símbolos)
- **Conexiones**: El parámetro `trustServerCertificate=true` es para desarrollo local
- **Encoding**: SQL Server usa UTF-16, por eso usamos `NVarChar` en lugar de `VarChar` 