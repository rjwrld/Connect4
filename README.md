# Connect4 - Proyecto Final

Juego Connect4 desarrollado con Node.js, TypeScript y SQL Server.

## Estudiantes
- Josue Calderon Barrantes

## Tecnologías Utilizadas

- **Backend**: Node.js + Express + TypeScript
- **Base de Datos**: SQL Server + Prisma ORM
- **Frontend**: HTML5 + CSS3 + JavaScript (Vanilla)
- **Herramientas**: nodemon, ts-node, Prisma Studio

## Funcionalidades Principales

1. **Crear Jugador**: Registro de nuevos jugadores con identificación única
2. **Crear Partida**: Iniciar nueva partida entre dos jugadores
3. **Cargar Partida**: Continuar partidas existentes
4. **Mostrar Escalafón**: Ranking de jugadores por marcador

## Requisitos Previos

- Node.js (versión 18 o superior)
- SQL Server (Express, Developer, o Docker)
- npm o yarn

## Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/rjwrld/Connect4.git
cd Connect4
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar SQL Server
Ver archivo: `config/database.md` para instrucciones detalladas.

### 4. Configurar variables de entorno
Crear archivo `.env` en la raíz del proyecto:
```env
DATABASE_URL="sqlserver://localhost:1433;database=Connect4DB;user=sa;password=TuPassword123!;encrypt=true;trustServerCertificate=true"
PORT=3000
NODE_ENV=development
```

### 5. Ejecutar migraciones
```bash
npm run db:generate
npm run db:migrate
```

## Comandos Disponibles

### Desarrollo
```bash
npm run dev          # Iniciar servidor en modo desarrollo
npm run build        # Compilar TypeScript
npm run start        # Iniciar servidor en producción
```

### Base de Datos
```bash
npm run db:generate  # Generar cliente Prisma
npm run db:migrate   # Crear y aplicar migraciones
npm run db:reset     # Resetear base de datos
npm run db:studio    # Abrir Prisma Studio
```

## Estructura del Proyecto

```
Connect4/
├── src/
│   ├── controllers/     # Controladores REST
│   ├── models/          # Modelos y lógica de negocio
│   ├── routes/          # Rutas de la API
│   └── public/          # Frontend (HTML/CSS/JS)
├── prisma/
│   └── schema.prisma    # Esquema de base de datos
├── config/
│   └── database.md      # Configuración SQL Server
└── package.json
```

## API Endpoints

### Jugadores
- `GET /api/jugadores` - Obtener todos los jugadores
- `POST /api/jugadores` - Crear nuevo jugador
- `PUT /api/jugadores/:id` - Actualizar estadísticas

### Partidas
- `GET /api/partidas` - Obtener todas las partidas
- `POST /api/partidas` - Crear nueva partida
- `POST /api/partidas/:id/movimiento` - Realizar movimiento
- `POST /api/partidas/:id/reiniciar` - Reiniciar partida

### Escalafón
- `GET /api/escalafon` - Obtener ranking de jugadores

## Lógica del Juego

- Tablero: 7 columnas × 6 filas
- Columnas: A-G (letras)
- Objetivo: Conectar 4 fichas (horizontal, vertical, diagonal)
- Detección automática de victoria y empate
- Sistema de puntuación: Ganadas - Perdidas

## Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## Licencia

Este proyecto está bajo la Licencia ISC. 