# Ejemplos de Código JavaScript

## 📋 Templates y Ejemplos para Desarrollar

### 1. `src/public/js/main.js` - Estructura Base

```javascript
// ===============================
// CONFIGURACIÓN GLOBAL
// ===============================

// Base URL de la API
const API_BASE_URL = 'http://localhost:3000/api';

// Estado global de la aplicación
const AppState = {
    partidaActual: null,
    jugadorActual: null,
    tablero: null,
    turno: 1,
    pantallasActivas: 'jugador'
};

// ===============================
// UTILIDADES GENERALES
// ===============================

class ConnectAPI {
    static async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Jugadores
    static async obtenerJugadores() {
        return await this.request('/jugadores');
    }

    static async crearJugador(data) {
        return await this.request('/jugadores', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // Partidas
    static async obtenerPartidas() {
        return await this.request('/partidas');
    }

    static async crearPartida(data) {
        return await this.request('/partidas', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    static async realizarMovimiento(partidaId, data) {
        return await this.request(`/partidas/${partidaId}/movimiento`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // Escalafón
    static async obtenerEscalafon() {
        return await this.request('/escalafon');
    }
}

// ===============================
// NAVEGACIÓN
// ===============================

function mostrarPantalla(nombrePantalla) {
    // Ocultar todas las pantallas
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Mostrar pantalla seleccionada
    const pantalla = document.getElementById(`${nombrePantalla}-screen`);
    if (pantalla) {
        pantalla.classList.add('active');
        AppState.pantallasActivas = nombrePantalla;
    }
    
    // Actualizar navbar
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.classList.remove('active');
    });
    
    const linkActivo = document.querySelector(`[data-screen="${nombrePantalla}"]`);
    if (linkActivo) {
        linkActivo.classList.add('active');
    }
}

function mostrarMensaje(contenedor, mensaje, tipo = 'info') {
    const div = document.createElement('div');
    div.className = `message ${tipo}`;
    div.textContent = mensaje;
    
    const contenedorEl = document.getElementById(contenedor);
    contenedorEl.innerHTML = '';
    contenedorEl.appendChild(div);
    
    // Auto-hide después de 3 segundos
    setTimeout(() => {
        div.remove();
    }, 3000);
}

// ===============================
// INICIALIZACIÓN
// ===============================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🎮 Connect4 - Iniciando aplicación...');
    
    // Configurar navegación
    document.querySelectorAll('[data-screen]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const pantalla = this.getAttribute('data-screen');
            mostrarPantalla(pantalla);
        });
    });
    
    // Inicializar módulos
    initJugadorModule();
    initPartidaModule();
    initEscalafonModule();
    
    // Mostrar pantalla inicial
    mostrarPantalla('jugador');
    
    console.log('✅ Aplicación inicializada');
});
```

### 2. `src/public/js/jugador.js` - Gestión de Jugadores

```javascript
// ===============================
// MÓDULO JUGADOR
// ===============================

function initJugadorModule() {
    const form = document.getElementById('jugador-form');
    
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            await crearJugador();
        });
    }
}

async function crearJugador() {
    const identificacion = document.getElementById('identificacion').value;
    const nombre = document.getElementById('nombre').value;
    
    // Validaciones básicas
    if (!identificacion || !nombre) {
        mostrarMensaje('jugador-resultado', 'Todos los campos son obligatorios', 'error');
        return;
    }
    
    if (identificacion.length < 7) {
        mostrarMensaje('jugador-resultado', 'La identificación debe tener al menos 7 dígitos', 'error');
        return;
    }
    
    if (nombre.length < 2) {
        mostrarMensaje('jugador-resultado', 'El nombre debe tener al menos 2 caracteres', 'error');
        return;
    }
    
    try {
        // Mostrar loading
        mostrarMensaje('jugador-resultado', 'Creando jugador...', 'info');
        
        const response = await ConnectAPI.crearJugador({
            identificacion: parseInt(identificacion),
            nombre: nombre.trim()
        });
        
        if (response.exito) {
            mostrarMensaje('jugador-resultado', 
                `✅ Jugador creado: ${response.datos.nombre}`, 'success');
            
            // Limpiar formulario
            document.getElementById('jugador-form').reset();
            
            // Actualizar listas de jugadores si están cargadas
            await cargarJugadoresEnSelects();
            
        } else {
            mostrarMensaje('jugador-resultado', 
                `❌ Error: ${response.mensaje}`, 'error');
        }
        
    } catch (error) {
        console.error('Error creando jugador:', error);
        mostrarMensaje('jugador-resultado', 
            '❌ Error de conexión. Intenta nuevamente.', 'error');
    }
}

// Cargar jugadores en los selects de crear partida
async function cargarJugadoresEnSelects() {
    try {
        const response = await ConnectAPI.obtenerJugadores();
        
        if (response.exito && response.datos) {
            const jugador1Select = document.getElementById('jugador1');
            const jugador2Select = document.getElementById('jugador2');
            
            // Limpiar opciones existentes (excepto la primera)
            [jugador1Select, jugador2Select].forEach(select => {
                if (select) {
                    while (select.children.length > 1) {
                        select.removeChild(select.lastChild);
                    }
                }
            });
            
            // Agregar jugadores
            response.datos.forEach(jugador => {
                const option1 = new Option(
                    `${jugador.nombre} (ID: ${jugador.identificacion})`, 
                    jugador.id
                );
                const option2 = option1.cloneNode(true);
                
                if (jugador1Select) jugador1Select.appendChild(option1);
                if (jugador2Select) jugador2Select.appendChild(option2);
            });
        }
    } catch (error) {
        console.error('Error cargando jugadores:', error);
    }
}
```

### 3. `src/public/js/partida.js` - Gestión de Partidas

```javascript
// ===============================
// MÓDULO PARTIDA
// ===============================

function initPartidaModule() {
    const form = document.getElementById('partida-form');
    
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            await crearPartida();
        });
    }
    
    // Cargar jugadores al entrar a la pantalla
    document.querySelector('[data-screen="partida"]')?.addEventListener('click', async function() {
        await cargarJugadoresEnSelects();
    });
}

async function crearPartida() {
    const jugador1Id = document.getElementById('jugador1').value;
    const jugador2Id = document.getElementById('jugador2').value;
    
    // Validaciones
    if (!jugador1Id || !jugador2Id) {
        mostrarMensaje('partida-resultado', 'Debes seleccionar ambos jugadores', 'error');
        return;
    }
    
    if (jugador1Id === jugador2Id) {
        mostrarMensaje('partida-resultado', 'Los jugadores deben ser diferentes', 'error');
        return;
    }
    
    try {
        mostrarMensaje('partida-resultado', 'Creando partida...', 'info');
        
        const response = await ConnectAPI.crearPartida({
            jugador1Id: parseInt(jugador1Id),
            jugador2Id: parseInt(jugador2Id)
        });
        
        if (response.exito) {
            mostrarMensaje('partida-resultado', 
                `✅ Partida creada entre ${response.datos.jugador1.nombre} y ${response.datos.jugador2.nombre}`, 
                'success');
            
            // Guardar partida actual
            AppState.partidaActual = response.datos;
            
            // Opcional: Cambiar a pantalla de juego
            // mostrarPantalla('cargar');
            // renderizarPartidaActual();
            
        } else {
            mostrarMensaje('partida-resultado', 
                `❌ Error: ${response.mensaje}`, 'error');
        }
        
    } catch (error) {
        console.error('Error creando partida:', error);
        mostrarMensaje('partida-resultado', 
            '❌ Error de conexión. Intenta nuevamente.', 'error');
    }
}

// ===============================
// RENDERIZADO DE TABLERO
// ===============================

function crearTableroHTML(tablero) {
    const container = document.getElementById('tablero-container');
    container.innerHTML = '';
    
    const tableroDiv = document.createElement('div');
    tableroDiv.className = 'tablero';
    tableroDiv.style.cssText = `
        display: grid;
        grid-template-columns: repeat(7, 60px);
        grid-template-rows: repeat(6, 60px);
        gap: 4px;
        background: #2c3e50;
        padding: 20px;
        border-radius: 10px;
        margin: 20px auto;
        width: fit-content;
    `;
    
    // Crear encabezados de columnas (A-G)
    const columnas = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    columnas.forEach((letra, colIndex) => {
        const header = document.createElement('div');
        header.textContent = letra;
        header.className = 'columna-header';
        header.style.cssText = `
            background: #34495e;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            cursor: pointer;
            border-radius: 5px;
            transition: background 0.3s;
        `;
        
        header.addEventListener('click', () => clickColumna(letra));
        header.addEventListener('mouseenter', () => {
            header.style.background = '#3498db';
        });
        header.addEventListener('mouseleave', () => {
            header.style.background = '#34495e';
        });
        
        tableroDiv.appendChild(header);
    });
    
    // Crear celdas del tablero
    for (let fila = 0; fila < 6; fila++) {
        for (let col = 0; col < 7; col++) {
            const celda = document.createElement('div');
            celda.className = 'celda';
            celda.style.cssText = `
                background: #ecf0f1;
                border-radius: 50%;
                border: 2px solid #bdc3c7;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                transition: all 0.3s;
            `;
            
            const valor = tablero[fila][col];
            if (valor === 1) {
                celda.style.background = '#e74c3c'; // Rojo - Jugador 1
                celda.textContent = '●';
            } else if (valor === 2) {
                celda.style.background = '#f39c12'; // Amarillo - Jugador 2
                celda.textContent = '●';
            }
            
            tableroDiv.appendChild(celda);
        }
    }
    
    container.appendChild(tableroDiv);
}

async function clickColumna(columnaLetra) {
    if (!AppState.partidaActual) {
        mostrarMensaje('partida-resultado', 'No hay partida activa', 'error');
        return;
    }
    
    if (AppState.partidaActual.estado !== 'en_curso') {
        mostrarMensaje('partida-resultado', 'La partida ya ha terminado', 'error');
        return;
    }
    
    try {
        const jugadorId = AppState.partidaActual.turnoActual === 1 ? 
            AppState.partidaActual.jugador1Id : 
            AppState.partidaActual.jugador2Id;
        
        const response = await ConnectAPI.realizarMovimiento(AppState.partidaActual.id, {
            jugadorId: jugadorId,
            columnaLetra: columnaLetra
        });
        
        if (response.exito) {
            // Actualizar estado
            AppState.partidaActual = response.datos;
            
            // Actualizar tablero visual
            const tablero = JSON.parse(response.datos.tablero);
            crearTableroHTML(tablero);
            
            // Verificar fin de partida
            if (response.partidaFinalizada) {
                if (response.esEmpate) {
                    mostrarMensaje('partida-resultado', '🤝 ¡Empate!', 'info');
                } else {
                    const ganador = response.datos.ganador;
                    mostrarMensaje('partida-resultado', 
                        `🎉 ¡${ganador.nombre} ha ganado!`, 'success');
                }
            } else {
                const jugadorActual = response.datos.turnoActual === 1 ? 
                    response.datos.jugador1 : response.datos.jugador2;
                mostrarMensaje('partida-resultado', 
                    `Turno de: ${jugadorActual.nombre}`, 'info');
            }
            
        } else {
            mostrarMensaje('partida-resultado', 
                `❌ ${response.mensaje}`, 'error');
        }
        
    } catch (error) {
        console.error('Error en movimiento:', error);
        mostrarMensaje('partida-resultado', 
            '❌ Error de conexión', 'error');
    }
}
```

### 4. `src/public/js/escalafon.js` - Escalafón

```javascript
// ===============================
// MÓDULO ESCALAFÓN
// ===============================

function initEscalafonModule() {
    // Cargar escalafón al entrar a la pantalla
    document.querySelector('[data-screen="escalafon"]')?.addEventListener('click', async function() {
        await cargarEscalafon();
    });
}

async function cargarEscalafon() {
    const container = document.getElementById('escalafon-tabla');
    
    try {
        container.innerHTML = '<div class="loading">Cargando escalafón...</div>';
        
        const response = await ConnectAPI.obtenerEscalafon();
        
        if (response.exito && response.datos) {
            renderizarEscalafon(response.datos);
        } else {
            container.innerHTML = '<div class="error">Error cargando escalafón</div>';
        }
        
    } catch (error) {
        console.error('Error cargando escalafón:', error);
        container.innerHTML = '<div class="error">Error de conexión</div>';
    }
}

function renderizarEscalafon(jugadores) {
    const container = document.getElementById('escalafon-tabla');
    
    if (!jugadores || jugadores.length === 0) {
        container.innerHTML = '<div class="empty">No hay jugadores registrados</div>';
        return;
    }
    
    const tabla = document.createElement('table');
    tabla.className = 'escalafon-table';
    tabla.style.cssText = `
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        background: white;
        border-radius: 10px;
        overflow: hidden;
    `;
    
    // Encabezados
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr style="background: #3498db; color: white;">
            <th style="padding: 15px; text-align: left;">#</th>
            <th style="padding: 15px; text-align: left;">Nombre</th>
            <th style="padding: 15px; text-align: center;">Marcador</th>
            <th style="padding: 15px; text-align: center;">Ganadas</th>
            <th style="padding: 15px; text-align: center;">Perdidas</th>
            <th style="padding: 15px; text-align: center;">Empates</th>
        </tr>
    `;
    
    // Cuerpo de la tabla
    const tbody = document.createElement('tbody');
    jugadores.forEach((jugador, index) => {
        const fila = document.createElement('tr');
        fila.style.cssText = `
            border-bottom: 1px solid #ecf0f1;
            transition: background 0.3s;
        `;
        
        fila.addEventListener('mouseenter', () => {
            fila.style.background = '#f8f9fa';
        });
        fila.addEventListener('mouseleave', () => {
            fila.style.background = 'white';
        });
        
        // Determinar color del marcador
        let marcadorColor = '#2c3e50';
        if (jugador.marcador > 0) marcadorColor = '#27ae60';
        if (jugador.marcador < 0) marcadorColor = '#e74c3c';
        
        fila.innerHTML = `
            <td style="padding: 15px; font-weight: bold; color: #3498db;">
                ${index + 1}
            </td>
            <td style="padding: 15px;">
                <div style="font-weight: bold;">${jugador.nombre}</div>
                <div style="font-size: 12px; color: #7f8c8d;">
                    ID: ${jugador.identificacion}
                </div>
            </td>
            <td style="padding: 15px; text-align: center; font-weight: bold; color: ${marcadorColor};">
                ${jugador.marcador > 0 ? '+' : ''}${jugador.marcador}
            </td>
            <td style="padding: 15px; text-align: center; color: #27ae60;">
                ${jugador.partidasGanadas}
            </td>
            <td style="padding: 15px; text-align: center; color: #e74c3c;">
                ${jugador.partidasPerdidas}
            </td>
            <td style="padding: 15px; text-align: center; color: #f39c12;">
                ${jugador.partidasEmpatadas}
            </td>
        `;
        
        tbody.appendChild(fila);
    });
    
    tabla.appendChild(thead);
    tabla.appendChild(tbody);
    
    container.innerHTML = '';
    container.appendChild(tabla);
    
    // Agregar estadísticas generales
    const stats = document.createElement('div');
    stats.style.cssText = `
        margin-top: 20px;
        padding: 15px;
        background: #ecf0f1;
        border-radius: 5px;
        text-align: center;
        color: #2c3e50;
    `;
    
    stats.innerHTML = `
        <strong>Total de jugadores: ${jugadores.length}</strong>
    `;
    
    container.appendChild(stats);
}
```

### 5. CSS Adicional para JavaScript

```css
/* Agregar a src/public/css/principal.css */

/* Mensajes */
.message {
    padding: 12px;
    margin: 10px 0;
    border-radius: 5px;
    font-weight: bold;
}

.message.success {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
}

.message.error {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
}

.message.info {
    background: #d1ecf1;
    color: #0c5460;
    border: 1px solid #bee5eb;
}

/* Estados */
.loading {
    text-align: center;
    padding: 20px;
    color: #6c757d;
}

.error {
    text-align: center;
    padding: 20px;
    color: #dc3545;
}

.empty {
    text-align: center;
    padding: 20px;
    color: #6c757d;
    font-style: italic;
}

/* Navbar activo */
.nav-menu a.active {
    background: #2980b9;
    color: white;
}

/* Tablero responsivo */
@media (max-width: 768px) {
    .tablero {
        grid-template-columns: repeat(7, 45px) !important;
        grid-template-rows: repeat(6, 45px) !important;
    }
    
    .escalafon-table {
        font-size: 14px;
    }
    
    .escalafon-table th,
    .escalafon-table td {
        padding: 8px !important;
    }
}
```

## 🎯 Notas para Implementar

### Orden Recomendado:
1. **Copiar `main.js`** → Base del sistema
2. **Copiar `jugador.js`** → Funcionalidad más simple
3. **Copiar `escalafon.js`** → Mostrar datos
4. **Copiar `partida.js`** → Funcionalidad más compleja
5. **Agregar CSS** → Mejorar apariencia

### Pruebas Importantes:
- Verificar que la API esté funcionando (`npm run dev`)
- Probar cada funcionalidad paso a paso
- Usar las herramientas de desarrollo del navegador
- Verificar respuestas de la API en Network tab

### Personalización:
- Colores del tablero
- Animaciones de fichas
- Sonidos de victoria
- Mejores validaciones
- Responsive design

¡Con estos ejemplos, tus compañeros deberían poder completar el frontend sin problemas! 🚀 