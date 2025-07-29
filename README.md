# 🎮 Connect4 - Proyecto Final

Juego Connect4 desarrollado con Node.js, TypeScript y SQL Server con arquitectura moderna y organizada.

## 👨‍💻 Estudiante
- **Josue Calderon Barrantes**

## 🚀 Tecnologías Utilizadas

- **Backend**: Node.js + Express + TypeScript
- **Base de Datos**: SQL Server + Prisma ORM
- **Frontend**: HTML5 + CSS3 + JavaScript (Vanilla)
- **Herramientas**: nodemon, ts-node, Prisma Studio

## 📁 Estructura del Proyecto

```
Connect4/
├── src/
│   ├── backend/              # 🎯 Lógica del servidor
│   │   ├── controllers/      # Controladores REST
│   │   ├── models/           # Modelos de datos
│   │   ├── routes/           # Rutas de la API
│   │   ├── services/         # Servicios de negocio
│   │   ├── middleware/       # Middleware personalizado
│   │   ├── utils/           # Utilidades
│   │   └── app.ts           # Aplicación principal
│   ├── frontend/            # 🎨 Interfaz de usuario
│   │   ├── css/            # Estilos
│   │   ├── js/             # JavaScript del cliente
│   │   └── index.html      # Página principal
│   └── types/              # 📝 Tipos TypeScript compartidos
├── prisma/                 # 🗄️ Esquema de base de datos
├── docs/                   # 📚 Documentación
├── config/                 # ⚙️ Configuraciones
├── scripts/                # 🔧 Scripts de desarrollo
└── tests/                  # 🧪 Pruebas
```

## ⚡ Configuración Rápida

### 1. **Instalación y Configuración**
```bash
# Clonar repositorio
git clone https://github.com/rjwrld/Connect4.git
cd Connect4

# Configuración automática (recomendado)
npm run setup
```

### 2. **Configuración Manual**
```bash
# Instalar dependencias
npm install

# Crear archivo .env
# Ver: config/database.md para instrucciones detalladas

# Ejecutar migraciones
npm run db:migrate

# Generar cliente Prisma
npm run db:generate
```

## 🎯 Comandos Disponibles

### **Desarrollo**
```bash
npm run dev           # Iniciar servidor en modo desarrollo
npm run quick-start   # Inicio rápido con verificaciones
npm run build         # Compilar TypeScript
npm run start         # Iniciar servidor en producción
```

### **Base de Datos**
```bash
npm run db:generate   # Generar cliente Prisma
npm run db:migrate    # Crear y aplicar migraciones
npm run db:push       # Sincronizar schema sin migración
npm run db:reset      # Resetear base de datos
npm run db:studio     # Abrir Prisma Studio
```

### **Pruebas y Utilidades**
```bash
npm test              # Probar conexión a BD
npm run setup         # Configuración inicial completa
```

## 🎮 Funcionalidades del Juego

### **Características Principales**
- ✅ **Crear Jugador**: Registro con identificación única
- ✅ **Crear Partida**: Inicio de nueva partida entre dos jugadores  
- ✅ **Cargar Partida**: Continuar partidas existentes
- ✅ **Escalafón**: Ranking dinámico de jugadores

### **Lógica del Connect4**
- 🎯 **Tablero**: 7 columnas (A-G) × 6 filas
- 🎯 **Objetivo**: Conectar 4 fichas consecutivas
- 🎯 **Detección automática**: Victoria, empate, movimientos válidos
- 🎯 **Estadísticas**: Actualización automática del marcador

## 🔗 API Endpoints

```
POST /api/jugadores              # Crear jugador
GET  /api/jugadores              # Listar jugadores
POST /api/partidas               # Crear partida
GET  /api/partidas               # Listar partidas
POST /api/partidas/:id/movimiento # Realizar movimiento
GET  /api/escalafon              # Obtener ranking
GET  /api/consultar-nombre/:id   # Consultar nombre de jugador
```

## 📋 Requisitos Previos

- **Node.js** (versión 18 o superior)
- **SQL Server** (Express, Developer, o Docker)
- **npm** o yarn

## 🗄️ Configuración de SQL Server

### **Opción 1: SQL Server Local**
1. Habilitar **TCP/IP** en SQL Server Configuration Manager
2. Configurar puerto **1433**
3. Usar **Windows Authentication** o **SQL Authentication**

### **Opción 2: Docker**
```bash
docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=TuPassword123!" \
  -p 1433:1433 --name sqlserver \
  -d mcr.microsoft.com/mssql/server:2022-latest
```

### **Variables de Entorno (.env)**
```env
# Windows Authentication (recomendado)
DATABASE_URL="sqlserver://localhost:1433;database=Connect4DB;integratedSecurity=true;encrypt=true;trustServerCertificate=true"

# SQL Authentication
DATABASE_URL="sqlserver://localhost:1433;database=Connect4DB;user=sa;password=TuPassword123!;encrypt=true;trustServerCertificate=true"

PORT=3000
NODE_ENV=development
```

## 📊 Estado del Proyecto

- **Backend**: ✅ 100% funcional
- **Base de Datos**: ✅ Esquema completo con migraciones
- **API**: ✅ Totalmente documentada y probada
- **Frontend**: ⚠️ Estructura básica (JavaScript pendiente)

## 🔧 Scripts de Desarrollo

### **PowerShell Scripts**
```bash
# Configuración inicial automática
.\scripts\setup.ps1

# Inicio rápido con verificaciones
.\scripts\start.ps1
```

## 📚 Documentación Adicional

- 📖 **[Guía de Desarrollo](docs/GUIA_DESARROLLO.md)** - Documentación técnica completa
- 🗄️ **[Configuración SQL Server](config/database.md)** - Instrucciones detalladas de BD
- 📝 **[Migración SQL Server](docs/MIGRATION_SQLSERVER.md)** - Proceso de migración
- 🎯 **[Entrega del Proyecto](docs/ENTREGA_COMPANEROS.md)** - Información para compañeros

## 🤝 Contribución

Este es un proyecto académico. Las mejoras y sugerencias son bienvenidas a través de issues y pull requests.

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE) para más detalles.

---

**🎮 ¡Disfruta jugando Connect4!** 