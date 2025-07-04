# Guía de Desarrollo - Connect4

## 📋 Estado Actual del Proyecto

### ✅ **Completado (85%)**
- Backend API completamente funcional
- Base de datos diseñada y migrada a SQL Server
- Lógica de juego Connect4 implementada
- Frontend básico (HTML/CSS)
- Documentación técnica

### 🔄 **En Desarrollo (15%)**
- JavaScript del frontend
- Integración frontend-backend
- Configuración de base de datos local
- Pruebas del sistema

---

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico
```
Frontend: HTML5 + CSS3 + JavaScript (Vanilla)
Backend: Node.js + Express + TypeScript
Base de Datos: SQL Server + Prisma ORM
Herramientas: nodemon, ts-node, Prisma Studio
```

### Estructura de Carpetas
```
Connect4/
├── src/
│   ├── controllers/          # ✅ Controladores REST (100%)
│   │   ├── JugadorControlador.ts
│   │   ├── PartidaControlador.ts
│   │   └── EscalafonControlador.ts
│   ├── models/              # ✅ Modelos y lógica (100%)
│   │   ├── Jugador.ts
│   │   └── Partida.ts
│   ├── routes/              # ✅ Rutas API (100%)
│   │   ├── jugadores.ts
│   │   ├── partidas.ts
│   │   └── escalafon.ts
│   ├── public/              # ⚠️ Frontend básico (70%)
│   │   ├── index.html       # ✅ Estructura HTML
│   │   ├── css/
│   │   │   └── principal.css # ✅ Estilos principales
│   │   └── js/              # ❌ JavaScript pendiente
│   │       ├── main.js      # ❌ Por crear
│   │       ├── jugador.js   # ❌ Por crear
│   │       ├── partida.js   # ❌ Por crear
│   │       └── escalafon.js # ❌ Por crear
│   └── app.ts               # ✅ Servidor Express
├── prisma/
│   └── schema.prisma        # ✅ Schema SQL Server
├── config/                  # ✅ Configuración
├── docs/                    # ✅ Documentación
└── package.json             # ✅ Dependencias
```

---

## 🎮 Lógica de Negocio

### Modelos de Datos

#### **Jugador** (`src/models/Jugador.ts`)
```typescript
interface Jugador {
  id: number;
  identificacion: bigint;    // Cédula única
  nombre: string;
  partidasGanadas: number;
  partidasPerdidas: number;
  partidasEmpatadas: number;
  marcador: number;          // ganadas - perdidas
}
```

#### **Partida** (`src/models/Partida.ts`)
```typescript
interface Partida {
  id: number;
  jugador1Id: number;
  jugador2Id: number;
  estado: 'en_curso' | 'finalizada';
  ganadorId?: number;
  resultado?: 'victoria' | 'empate';
  tablero: number[][];       // 7x6 matriz
  turnoActual: 1 | 2;
}
```

#### **Movimiento** (`prisma/schema.prisma`)
```sql
-- Registro de cada movimiento
id, partidaId, jugadorId, columnaLetra, filaPosicion, numeroMovimiento
```

### Lógica del Juego Connect4

#### **Tablero** (`LogicaConnect4` clase)
- **Dimensiones**: 7 columnas (A-G) × 6 filas (0-5)
- **Representación**: `number[][]` donde `0=vacío, 1=jugador1, 2=jugador2`
- **Gravedad**: Las fichas caen hasta la posición más baja disponible

#### **Mecánicas Implementadas**
```typescript
// Crear tablero vacío 7x6
LogicaConnect4.crearTableroVacio()

// Verificar si se puede jugar en columna
LogicaConnect4.puedeJugarEnColumna(tablero, columna)

// Realizar movimiento (devuelve fila donde cayó)
LogicaConnect4.realizarMovimiento(tablero, columna, jugador)

// Verificar victoria (4 en línea)
LogicaConnect4.verificarVictoria(tablero, fila, columna, jugador)

// Verificar empate (42 fichas)
LogicaConnect4.verificarEmpate(tablero)
```

#### **Detección de Victoria**
- ✅ **Horizontal**: 4 fichas consecutivas en fila
- ✅ **Vertical**: 4 fichas consecutivas en columna
- ✅ **Diagonal Principal**: 4 fichas en diagonal ↘
- ✅ **Diagonal Secundaria**: 4 fichas en diagonal ↙

---

## 🌐 API REST Documentada

### Base URL: `http://localhost:3000/api`

### **Jugadores**
```typescript
// GET /api/jugadores - Listar todos los jugadores
Response: { exito: boolean, datos: Jugador[] }

// GET /api/jugadores/:id - Obtener jugador por ID
Response: { exito: boolean, datos: Jugador }

// POST /api/jugadores - Crear nuevo jugador
Body: { identificacion: number, nombre: string }
Response: { exito: boolean, datos: Jugador }

// PUT /api/jugadores/:id - Actualizar estadísticas
Body: { partidasGanadas: number, partidasPerdidas: number, partidasEmpatadas: number }
Response: { exito: boolean, datos: Jugador }
```

### **Partidas**
```typescript
// GET /api/partidas - Listar todas las partidas
Response: { exito: boolean, datos: Partida[] }

// GET /api/partidas/:id - Obtener partida por ID
Response: { exito: boolean, datos: Partida }

// POST /api/partidas - Crear nueva partida
Body: { jugador1Id: number, jugador2Id: number }
Response: { exito: boolean, datos: Partida }

// POST /api/partidas/:id/movimiento - Realizar movimiento
Body: { jugadorId: number, columnaLetra: 'A'|'B'|'C'|'D'|'E'|'F'|'G' }
Response: { 
  exito: boolean, 
  datos: Partida,
  partidaFinalizada: boolean,
  ganador?: number,
  esEmpate: boolean
}

// POST /api/partidas/:id/reiniciar - Reiniciar con mismos jugadores
Response: { exito: boolean, datos: Partida }
```

### **Escalafón**
```typescript
// GET /api/escalafon - Ranking de jugadores
Response: { 
  exito: boolean, 
  datos: JugadorEscalafon[],
  total: number
}
```

---

## 📱 Frontend Actual

### **Estructura HTML** (`src/public/index.html`)
```html
<!DOCTYPE html>
<html>
<head>
    <title>Connect4</title>
    <link rel="stylesheet" href="css/principal.css">
</head>
<body>
    <!-- ✅ Navegación principal -->
    <nav class="navbar">
        <div class="nav-container">
            <h1 class="nav-title">Connect4</h1>
            <ul class="nav-menu">
                <li><a href="#" data-screen="jugador">Crear Jugador</a></li>
                <li><a href="#" data-screen="partida">Crear Partida</a></li>
                <li><a href="#" data-screen="cargar">Cargar Partida</a></li>
                <li><a href="#" data-screen="escalafon">Escalafón</a></li>
            </ul>
        </div>
    </nav>

    <!-- ✅ Pantalla 1: Crear Jugador -->
    <div id="jugador-screen" class="screen active">
        <h2>Crear Nuevo Jugador</h2>
        <form id="jugador-form">
            <input type="number" id="identificacion" placeholder="Identificación" required>
            <input type="text" id="nombre" placeholder="Nombre completo" required>
            <button type="submit">Crear Jugador</button>
        </form>
        <div id="jugador-resultado"></div>
    </div>

    <!-- ✅ Pantalla 2: Crear Partida -->
    <div id="partida-screen" class="screen">
        <h2>Crear Nueva Partida</h2>
        <form id="partida-form">
            <select id="jugador1" required>
                <option value="">Seleccionar Jugador 1</option>
            </select>
            <select id="jugador2" required>
                <option value="">Seleccionar Jugador 2</option>
            </select>
            <button type="submit">Crear Partida</button>
        </form>
        <div id="partida-resultado"></div>
    </div>

    <!-- ✅ Pantalla 3: Cargar Partida -->
    <div id="cargar-screen" class="screen">
        <h2>Cargar Partida</h2>
        <div id="partidas-lista"></div>
        <div id="juego-container" style="display: none;">
            <div id="juego-info"></div>
            <div id="tablero-container"></div>
            <div id="controles-juego"></div>
        </div>
    </div>

    <!-- ✅ Pantalla 4: Escalafón -->
    <div id="escalafon-screen" class="screen">
        <h2>Escalafón de Jugadores</h2>
        <div id="escalafon-tabla"></div>
    </div>

    <!-- ❌ JavaScript pendiente -->
    <script src="js/main.js"></script>
</body>
</html>
```

### **Estilos CSS** (`src/public/css/principal.css`)
- ✅ **Diseño moderno y responsive**
- ✅ **Navbar con navegación por pestañas**
- ✅ **Formularios estilizados**
- ✅ **Sistema de pantallas (screens)**
- ✅ **Variables CSS para colores**
- ✅ **Efectos hover y transiciones**

---

## 🔧 Configuración de Desarrollo

### **Requisitos Previos**
```bash
# Node.js 18+
node --version

# SQL Server (una de estas opciones)
# 1. Docker (recomendado)
docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=TuPassword123!" -p 1433:1433 --name sqlserver -d mcr.microsoft.com/mssql/server:2022-latest

# 2. SQL Server Express (Windows)
# Descargar desde Microsoft

# 3. Azure SQL Database (cloud)
```

### **Configuración Inicial**
```bash
# 1. Clonar e instalar
git clone <repo>
cd Connect4
npm install

# 2. Configurar variables de entorno
# Crear archivo .env
DATABASE_URL="sqlserver://localhost:1433;database=Connect4DB;user=sa;password=TuPassword123!;encrypt=true;trustServerCertificate=true"
PORT=3000
NODE_ENV=development

# 3. Configurar base de datos
npm run db:generate
npm run db:migrate

# 4. Iniciar desarrollo
npm run dev
```

### **Comandos Útiles**
```bash
# Desarrollo
npm run dev          # Servidor con recarga automática
npm run build        # Compilar TypeScript
npm run start        # Producción

# Base de datos
npm run db:generate  # Generar cliente Prisma
npm run db:migrate   # Aplicar migraciones
npm run db:reset     # Resetear BD
npm run db:studio    # Abrir Prisma Studio

# Verificación
npx tsc --noEmit     # Verificar TypeScript
```

---

## 📝 Tareas Pendientes

### **1. JavaScript del Frontend (Crítico)**
**Archivos a crear:**

#### `src/public/js/main.js`
```javascript
// ❌ Por implementar
// - Navegación entre pantallas
// - Manejo de eventos
// - Comunicación con API
// - Manejo de errores
```

#### `src/public/js/jugador.js`
```javascript
// ❌ Por implementar
// - Formulario crear jugador
// - Validación de datos
// - Llamadas a API /api/jugadores
```

#### `src/public/js/partida.js`
```javascript
// ❌ Por implementar
// - Cargar lista de jugadores
// - Crear nueva partida
// - Renderizar tablero 7x6
// - Manejo de clicks en columnas
// - Lógica de turnos
// - Detección victoria/empate
```

#### `src/public/js/escalafon.js`
```javascript
// ❌ Por implementar
// - Cargar y mostrar escalafón
// - Tabla responsive
// - Ordenamiento por marcador
```

### **2. Funcionalidades Específicas**

#### **Tablero Interactivo**
```javascript
// Crear tablero HTML 7x6
function crearTablero() {
  // Generar grid CSS
  // Agregar event listeners
  // Animaciones de fichas cayendo
}

// Manejar click en columna
function clickColumna(columnaLetra) {
  // Validar turno
  // Enviar movimiento a API
  // Actualizar tablero visual
  // Verificar fin de partida
}
```

#### **Gestión de Estados**
```javascript
// Estado global de la aplicación
const AppState = {
  partidaActual: null,
  jugadorActual: null,
  tablero: null,
  turno: 1
};
```

### **3. Integración Frontend-Backend**
```javascript
// Clase para comunicación con API
class ConnectAPI {
  static async crearJugador(data) {
    // POST /api/jugadores
  }
  
  static async crearPartida(data) {
    // POST /api/partidas
  }
  
  static async realizarMovimiento(partidaId, data) {
    // POST /api/partidas/:id/movimiento
  }
  
  static async obtenerEscalafon() {
    // GET /api/escalafon
  }
}
```

### **4. Configuración de Producción**
- ❌ Variables de entorno para producción
- ❌ Configuración de CORS
- ❌ Logging y monitoreo
- ❌ Manejo de errores global

---

## 🎯 Roadmap de Desarrollo

### **Sprint 1: Frontend JavaScript (Prioridad Alta)**
- [ ] `main.js` - Navegación y estructura base
- [ ] `jugador.js` - Funcionalidad crear jugador
- [ ] `escalafon.js` - Mostrar ranking
- [ ] Integración básica con API

### **Sprint 2: Gameplay (Prioridad Alta)**
- [ ] `partida.js` - Crear partida
- [ ] Renderizado del tablero 7x6
- [ ] Manejo de clicks y turnos
- [ ] Integración completa con lógica backend

### **Sprint 3: Cargar Partida (Prioridad Media)**
- [ ] Lista de partidas existentes
- [ ] Cargar estado de partida
- [ ] Continuar partida desde último movimiento

### **Sprint 4: Mejoras y Pulido (Prioridad Baja)**
- [ ] Animaciones y efectos visuales
- [ ] Responsive design mejorado
- [ ] Manejo de errores UX
- [ ] Optimizaciones de performance

---

## 🚀 Cómo Continuar

### **Para el Compañero que tome Frontend:**

1. **Comenzar con `main.js`:**
   ```javascript
   // Estructura básica
   document.addEventListener('DOMContentLoaded', function() {
     // Inicializar navegación
     // Configurar event listeners
     // Cargar datos iniciales
   });
   ```

2. **Estudiar la API:**
   - Revisar `src/controllers/` para entender endpoints
   - Usar Postman/Thunder Client para probar API
   - Revisar estructura de respuestas

3. **Implementar pantalla por pantalla:**
   - Empezar con "Crear Jugador" (más simple)
   - Continuar con "Escalafón" 
   - Luego "Crear Partida"
   - Finalmente "Cargar Partida" (más complejo)

### **Para el Compañero que tome Backend:**

1. **Validar funcionamiento:**
   ```bash
   npm run dev
   # Probar endpoints con Postman
   ```

2. **Posibles mejoras:**
   - Validaciones adicionales
   - Logging y monitoreo
   - Optimizaciones de queries
   - Manejo de errores mejorado

3. **Base de datos:**
   - Configurar SQL Server local
   - Crear datos de prueba
   - Documentar queries complejas

---

## 📞 Contacto y Dudas

**Arquitectura decidida:** ✅ Completa y funcional
**Documentación:** ✅ Completa y detallada
**Backend:** ✅ 100% funcional
**Frontend:** ❌ 30% - Necesita JavaScript

**Prioridad:** Completar JavaScript del frontend para tener sistema funcional completo.

**Tiempo estimado:** 2-3 días de desarrollo para funcionalidad completa.

---

*Última actualización: [Fecha actual]*
*Versión: 1.0*
*Estado: Listo para desarrollo frontend* 