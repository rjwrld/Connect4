# Migración de PostgreSQL a SQL Server

## Resumen de Cambios

Este documento describe los cambios realizados para migrar el proyecto Connect4 de PostgreSQL a SQL Server.

## Cambios en el Schema de Prisma

### 1. Provider de Base de Datos
```diff
datasource db {
- provider = "postgresql"
+ provider = "sqlserver"
  url      = env("DATABASE_URL")
}
```

### 2. Tipos de Datos

| Campo | PostgreSQL | SQL Server |
|-------|------------|------------|
| `nombre` | `@db.VarChar(255)` | `@db.NVarChar(255)` |
| `estado` | `@db.VarChar(20)` | `@db.NVarChar(20)` |
| `resultado` | `@db.VarChar(10)` | `@db.NVarChar(10)` |
| `columnaLetra` | `@db.Char(1)` | `@db.NChar(1)` |
| `tablero` | `Json @db.JsonB` | `String @db.NVarChar(Max)` |
| `fechaCreacion` | `@db.Timestamptz(6)` | `@db.DateTime2` |

### 3. Manejo de JSON

**PostgreSQL** (nativo):
```typescript
// Guardado directo
tablero: tableroArray

// Lectura directa
const tablero = partida.tablero as number[][];
```

**SQL Server** (como string):
```typescript
// Guardado con conversión
tablero: JSON.stringify(tableroArray)

// Lectura con parsing
const tablero = JSON.parse(partida.tablero as string);
```

## Cambios en el Código

### 1. Funciones Auxiliares Agregadas

```typescript
const TableroUtils = {
  toJson(tablero: Tablero): string {
    return JSON.stringify(tablero);
  },
  
  fromJson(tableroJson: string | Tablero): Tablero {
    if (typeof tableroJson === 'string') {
      return JSON.parse(tableroJson) as Tablero;
    }
    return tableroJson as Tablero;
  }
};
```

### 2. Controlador Actualizado

- **Creación**: `tablero: TableroUtils.toJson(tableroVacio)`
- **Lectura**: `const tablero = TableroUtils.fromJson(partida.tablero as string)`
- **Actualización**: `tablero: TableroUtils.toJson(tablero)`

## Configuración de Conexión

### PostgreSQL
```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/connect4db"
```

### SQL Server
```env
DATABASE_URL="sqlserver://localhost:1433;database=Connect4DB;user=sa;password=TuPassword123!;encrypt=true;trustServerCertificate=true"
```

## Ventajas de SQL Server

### 1. **Integración con Ecosistema Microsoft**
- Mejor integración con herramientas Microsoft
- Soporte nativo en Azure
- Herramientas de administración avanzadas (SSMS)

### 2. **Características Empresariales**
- Mejor soporte para transacciones distribuidas
- Herramientas de monitoreo incluidas
- Planes de ejecución detallados

### 3. **Desarrollo**
- SQL Server Express gratuito para desarrollo
- Mejor soporte en Windows
- Herramientas de debugging integradas

## Consideraciones Importantes

### 1. **Rendimiento**
- SQL Server puede ser más eficiente en consultas complejas
- PostgreSQL puede ser mejor para operaciones JSON nativas
- Para este proyecto, la diferencia es mínima

### 2. **Escalabilidad**
- SQL Server tiene mejor escalabilidad vertical
- PostgreSQL mejor escalabilidad horizontal
- Para un proyecto universitario, ambos son más que suficientes

### 3. **Licenciamiento**
- PostgreSQL: Completamente gratuito
- SQL Server: Express gratuito, versiones comerciales de pago

## Pasos para Migrar

Si alguien quiere migrar de vuelta a PostgreSQL:

1. **Cambiar schema**:
   ```prisma
   provider = "postgresql"
   ```

2. **Revertir tipos**:
   ```prisma
   tablero Json @default("[]") @db.JsonB
   fechaCreacion DateTime @default(now()) @db.Timestamptz(6)
   ```

3. **Simplificar código**:
   ```typescript
   // Directo sin conversión
   const tablero = partida.tablero as number[][];
   ```

4. **Actualizar conexión**:
   ```env
   DATABASE_URL="postgresql://..."
   ```

## Comandos de Migración

```bash
# 1. Regenerar cliente Prisma
npm run db:generate

# 2. Crear nueva migración
npm run db:migrate

# 3. Verificar schema
npm run db:studio
```

## Conclusión

La migración a SQL Server es completamente exitosa. El proyecto mantiene todas sus funcionalidades mientras aprovecha las ventajas de SQL Server para el entorno de desarrollo y posible despliegue empresarial. 