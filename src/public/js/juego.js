// ===== LÓGICA DEL JUEGO =====

let tableroJuego = [];
let jugadorActual = 1;

// Asignar eventos a los botones de columna
document.querySelectorAll('.btn-columna').forEach(boton => {
  boton.addEventListener('click', () => {
    const letra = boton.dataset.columna;
    jugarColumna(letra);
  });
});

// Función para iniciar el juego
async function iniciarJuego(partida) {
    try {
        partidaActual = partida;
        
        // Cargar información de los jugadores
        const jugador1 = await obtenerJugadorPorId(partida.jugador1Id);
        const jugador2 = await obtenerJugadorPorId(partida.jugador2Id);
        
        // Actualizar interfaz
        document.getElementById('nombre-jugador1').textContent = jugador1.nombre;
        document.getElementById('nombre-jugador2').textContent = jugador2.nombre;
        
        // Configurar tablero
        inicializarTablero();
        
        // Configurar turno
        jugadorActual = partida.turnoActual || 1;
        actualizarTurno();
        
        // Si hay un tablero guardado, cargarlo
        if (partida.tablero && partida.tablero !== '[]') {
            cargarTableroDesdePartida(partida.tablero);
        }
        
        // Mostrar pantalla de juego
        mostrarJuego();
        
    } catch (error) {
        console.error('Error al iniciar juego:', error);
        mostrarMensaje('mensaje-partida', 
            `Error al iniciar el juego: ${error.message}`, 'error');
    }
}

// Función para inicializar el tablero vacío
function inicializarTablero() {
    const cuerpoTablero = document.getElementById('cuerpo-tablero');
    if (!cuerpoTablero) return;
    
    // Crear tablero 6x7 (6 filas, 7 columnas)
    tableroJuego = Array(6).fill(null).map(() => Array(7).fill(0));
    
    // Generar HTML del tablero
    cuerpoTablero.innerHTML = '';
    
    for (let fila = 0; fila < 6; fila++) {
        const tr = document.createElement('tr');
        
        for (let columna = 0; columna < 7; columna++) {
            const td = document.createElement('td');
            td.className = 'celda-tablero';
            td.dataset.fila = fila;
            td.dataset.columna = columna;
            
            const ficha = document.createElement('div');
            ficha.className = 'ficha vacia';
            td.appendChild(ficha);
            
            tr.appendChild(td);
        }
        
        cuerpoTablero.appendChild(tr);
    }
}

// Función para cargar tablero desde una partida guardada
function cargarTableroDesdePartida(tableroString) {
    try {
        const tableroGuardado = JSON.parse(tableroString);
        
        for (let fila = 0; fila < 6; fila++) {
            for (let columna = 0; columna < 7; columna++) {
                const valor = tableroGuardado[fila][columna];
                tableroJuego[fila][columna] = valor;
                
                const celda = document.querySelector(`[data-fila="${fila}"][data-columna="${columna}"]`);
                const ficha = celda.querySelector('.ficha');
                
                if (valor === 1) {
                    ficha.className = 'ficha roja';
                } else if (valor === 2) {
                    ficha.className = 'ficha amarilla';
                } else {
                    ficha.className = 'ficha vacia';
                }
            }
        }
    } catch (error) {
        console.error('Error al cargar tablero:', error);
    }
}

// Función para actualizar la indicación de turno
function actualizarTurno() {
    const spanTurno = document.getElementById('jugador-turno');
    const nombreJugador1 = document.getElementById('nombre-jugador1').textContent;
    const nombreJugador2 = document.getElementById('nombre-jugador2').textContent;
    
    if (spanTurno) {
        spanTurno.textContent = jugadorActual === 1 ? nombreJugador1 : nombreJugador2;
        spanTurno.className = jugadorActual === 1 ? 'jugador1' : 'jugador2';
    }
}

// Función para jugar en una columna
async function jugarColumna(letraColumna) {
    const columnaIndex = letraColumna.charCodeAt(0) - 65; // A=0, B=1, etc.
    
    if (!partidaActual) {
        mostrarMensaje('resultado-juego', 'No hay partida activa', 'error');
        return;
    }
    
    // Buscar la fila más baja disponible en la columna
    let filaDestino = -1;
    for (let fila = 5; fila >= 0; fila--) {
        if (tableroJuego[fila][columnaIndex] === 0) {
            filaDestino = fila;
            break;
        }
    }
    
    if (filaDestino === -1) {
        mostrarMensaje('resultado-juego', 'Columna llena', 'error');
        return;
    }
    
    try {
        mostrarLoading(true);
        
        // Realizar movimiento en el servidor
        const datosMovimiento = {
            columnaLetra: letraColumna,
            jugadorId: jugadorActual === 1 ? partidaActual.jugador1Id : partidaActual.jugador2Id
        };
        
        const resultado = await realizarMovimiento(partidaActual.id, datosMovimiento);
        
        // Actualizar tablero local
        tableroJuego[filaDestino][columnaIndex] = jugadorActual;
        
        // Actualizar interfaz
        const celda = document.querySelector(`[data-fila="${filaDestino}"][data-columna="${columnaIndex}"]`);
        const ficha = celda.querySelector('.ficha');
        
        ficha.className = jugadorActual === 1 ? 'ficha roja' : 'ficha amarilla';
        
        // Verificar si hay ganador o empate
        if (resultado.estado === 'finalizada') {
            manejarFinDelJuego(resultado);
        } else {
            // Cambiar turno
            jugadorActual = jugadorActual === 1 ? 2 : 1;
            actualizarTurno();
        }
        
    } catch (error) {
        console.error('Error al realizar movimiento:', error);
        mostrarMensaje('resultado-juego', 
            `Error: ${error.message}`, 'error');
    } finally {
        mostrarLoading(false);
    }
}

// Función para manejar el fin del juego
function manejarFinDelJuego(resultado) {
    const divResultado = document.getElementById('resultado-juego');
    
    let mensaje = '';
    let clase = '';
    
    if (resultado.resultado === 'empate') {
        mensaje = '¡EMPATE! 🤝';
        clase = 'empate';
    } else {
        const nombreGanador = resultado.ganadorId === partidaActual.jugador1Id 
            ? document.getElementById('nombre-jugador1').textContent
            : document.getElementById('nombre-jugador2').textContent;
        
        mensaje = `¡${nombreGanador} GANA! 🏆`;
        clase = 'ganador';
    }
    
    if (divResultado) {
        divResultado.innerHTML = `
            <div class="resultado-final ${clase}">
                <h3>${mensaje}</h3>
                <div class="botones-resultado">
                    <button onclick="mostrarMenuPrincipal()" class="btn btn-primary">
                        🏠 Menú Principal
                    </button>
                    <button onclick="mostrarEscalafon()" class="btn btn-secondary">
                        🏆 Ver Escalafón
                    </button>
                </div>
            </div>
        `;
    }
    
    // Deshabilitar botones de columna
    const botones = document.querySelectorAll('.btn-columna');
    botones.forEach(boton => {
        boton.disabled = true;
    });
}

// Función para reiniciar partida
async function reiniciarPartida() {
    if (!partidaActual) return;
    
    try {
        mostrarLoading(true);
        
        // Crear nueva partida con los mismos jugadores
        const nuevaPartida = await crearPartida({
            jugador1Id: partidaActual.jugador1Id,
            jugador2Id: partidaActual.jugador2Id
        });
        
        // Iniciar el nuevo juego
        iniciarJuego(nuevaPartida);
        
    } catch (error) {
        console.error('Error al reiniciar partida:', error);
        mostrarMensaje('resultado-juego', 
            `Error al reiniciar: ${error.message}`, 'error');
    } finally {
        mostrarLoading(false);
    }
}

// Función para cargar partidas existentes
async function cargarPartidasExistentes() {
    try {
        mostrarLoading(true);
        
        const partidas = await obtenerPartidas();
        const listaPartidas = document.getElementById('lista-partidas');
        
        if (!listaPartidas) return;
        
        listaPartidas.innerHTML = '';
        
        if (partidas.length === 0) {
            listaPartidas.innerHTML = `
                <div class="sin-partidas">
                    <p>No hay partidas guardadas</p>
                    <button onclick="mostrarMenuPrincipal()" class="btn btn-primary">
                        Crear Nueva Partida
                    </button>
                </div>
            `;
            return;
        }
        
        // Mostrar partidas disponibles
        partidas.forEach(partida => {
            const div = document.createElement('div');
            div.className = 'item-partida';
            div.innerHTML = `
                <div class="info-partida">
                    <h4>Partida #${partida.id}</h4>
                    <p><strong>Jugadores:</strong> ${partida.jugador1.nombre} vs ${partida.jugador2.nombre}</p>
                    <p><strong>Estado:</strong> ${partida.estado === 'en_curso' ? 'En curso' : 'Finalizada'}</p>
                    <p><strong>Fecha:</strong> ${new Date(partida.fechaCreacion).toLocaleDateString()}</p>
                </div>
                <div class="acciones-partida">
                    ${partida.estado === 'en_curso' 
                        ? `<button onclick="cargarPartida(${partida.id})" class="btn btn-primary">Continuar</button>`
                        : `<button onclick="verPartida(${partida.id})" class="btn btn-secondary">Ver</button>`
                    }
                </div>
            `;
            listaPartidas.appendChild(div);
        });
        
    } catch (error) {
        console.error('Error al cargar partidas:', error);
        const listaPartidas = document.getElementById('lista-partidas');
        if (listaPartidas) {
            listaPartidas.innerHTML = `
                <div class="error-partidas">
                    <p>Error al cargar las partidas: ${error.message}</p>
                </div>
            `;
        }
    } finally {
        mostrarLoading(false);
    }
}

// Función para cargar una partida específica
async function cargarPartida(partidaId) {
    try {
        mostrarLoading(true);
        
        const partida = await obtenerPartidaPorId(partidaId);
        iniciarJuego(partida);
        
    } catch (error) {
        console.error('Error al cargar partida:', error);
        mostrarMensaje('mensaje-partida', 
            `Error al cargar partida: ${error.message}`, 'error');
    } finally {
        mostrarLoading(false);
    }
    
}
