// ===== LÓGICA DEL JUEGO =====

let tableroJuego = [];
let jugadorActual = 1;

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
        
        // Limpiar animaciones previas
        limpiarAnimacionesTablero();
        
        // Habilitar botones de columna
        habilitarBotonesColumna(true);
        
        // Limpiar resultados previos
        const divResultado = document.getElementById('resultado-juego');
        if (divResultado) {
            divResultado.innerHTML = '';
        }
        
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
        // Deshabilitar temporalmente todos los botones para evitar clicks múltiples
        habilitarBotonesColumna(false);
        mostrarLoading(true);
        
        // Realizar movimiento en el servidor
        const datosMovimiento = {
            columnaLetra: letraColumna,
            jugadorId: jugadorActual === 1 ? partidaActual.jugador1Id : partidaActual.jugador2Id
        };
        
        const resultado = await realizarMovimiento(partidaActual.id, datosMovimiento);
        
        // Actualizar tablero local
        tableroJuego[filaDestino][columnaIndex] = jugadorActual;
        
        // Actualizar interfaz con animación
        const celda = document.querySelector(`[data-fila="${filaDestino}"][data-columna="${columnaIndex}"]`);
        const ficha = celda.querySelector('.ficha');
        
        // Agregar animación de caída
        ficha.className = `ficha nueva ${jugadorActual === 1 ? 'roja' : 'amarilla'}`;
        
        // Después de la animación de caída, agregar efecto de rebote
        setTimeout(() => {
            ficha.classList.remove('nueva');
            ficha.classList.add('rebote');
            
            // Remover clase de rebote después de la animación
            setTimeout(() => {
                ficha.classList.remove('rebote');
            }, 300);
        }, 600);
        
        // Verificar si hay ganador o empate - CORREGIDO
        if (resultado.partidaFinalizada || resultado.datos?.estado === 'finalizada') {
            // Esperar a que termine la animación antes de mostrar resultado
            setTimeout(() => {
                manejarFinDelJuego(resultado);
            }, 900);
        } else {
            // Cambiar turno - CORREGIDO para usar datos del backend
            jugadorActual = resultado.datos?.turnoActual || (jugadorActual === 1 ? 2 : 1);
            actualizarTurno();
            
            // Reactivar botones después de la animación
            setTimeout(() => {
                habilitarBotonesColumna(true);
            }, 700);
        }
        
    } catch (error) {
        console.error('Error al realizar movimiento:', error);
        mostrarMensaje('resultado-juego', 
            `Error: ${error.message}`, 'error');
        
        // Reactivar botones en caso de error
        habilitarBotonesColumna(true);
    } finally {
        mostrarLoading(false);
    }
}

// Función para habilitar/deshabilitar botones de columna
function habilitarBotonesColumna(habilitar = true) {
    const botones = document.querySelectorAll('.btn-columna');
    botones.forEach(boton => {
        boton.disabled = !habilitar;
        
        // Limpiar texto de bloqueo si existe
        if (habilitar && boton.textContent.includes('🔒')) {
            boton.textContent = boton.textContent.replace(' 🔒', '');
        }
    });
}

// Función mejorada para mostrar fichas ganadoras
function resaltarFichasGanadoras(posiciones) {
    if (!posiciones || posiciones.length === 0) return;
    
    posiciones.forEach(pos => {
        const celda = document.querySelector(`[data-fila="${pos.fila}"][data-columna="${pos.columna}"]`);
        if (celda) {
            const ficha = celda.querySelector('.ficha');
            if (ficha) {
                ficha.classList.add('victoria');
            }
        }
    });
}

// Función para limpiar animaciones del tablero
function limpiarAnimacionesTablero() {
    const fichas = document.querySelectorAll('.ficha');
    fichas.forEach(ficha => {
        ficha.classList.remove('nueva', 'rebote', 'victoria');
    });
}

// Función para manejar el fin del juego
function manejarFinDelJuego(resultado) {
    // Deshabilitar botones de columna
    const botones = document.querySelectorAll('.btn-columna');
    botones.forEach(boton => {
        boton.disabled = true;
    });
    
    // Mostrar modal de resultado
    mostrarModalResultado(resultado);
}

// Función para reiniciar partida
async function reiniciarPartida() {
    if (!partidaActual) return;
    
    try {
        mostrarLoading(true, 'Reiniciando partida...');
        
        // Crear nueva partida con los mismos jugadores
        const nuevaPartida = await crearPartida({
            jugador1Id: partidaActual.jugador1Id,
            jugador2Id: partidaActual.jugador2Id
        });
        
        // Cargar la nueva partida
        partidaActual = nuevaPartida;
        jugadorActual = 1; // Siempre empieza el jugador 1
        
        // Inicializar tablero limpio
        inicializarTablero();
        limpiarAnimacionesTablero();
        
        // Actualizar información de la partida
        actualizarTurno();
        
        // Limpiar resultado anterior
        const divResultado = document.getElementById('resultado-juego');
        if (divResultado) {
            divResultado.innerHTML = '';
        }
        
        // Habilitar botones
        habilitarBotonesColumna(true);
        
        console.log('🔄 Partida reiniciada:', nuevaPartida);
        
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
                    <button onclick="mostrarCrearPartida()" class="btn btn-primary">
                        📝 Crear Nueva Partida
                    </button>
                </div>
            `;
            return;
        }
        
        // Mostrar partidas disponibles con información mejorada
        partidas.forEach(partida => {
            const div = document.createElement('div');
            div.className = 'item-partida';
            
            // Determinar información adicional para partidas finalizadas
            let infoAdicional = '';
            if (partida.estado === 'finalizada') {
                if (partida.resultado === 'empate') {
                    infoAdicional = '<p><strong>Resultado:</strong> 🤝 Empate</p>';
                } else if (partida.ganador) {
                    const ganadorNombre = partida.ganador.nombre || 
                        (partida.ganadorId === partida.jugador1Id ? partida.jugador1.nombre : partida.jugador2.nombre);
                    infoAdicional = `<p><strong>Ganador:</strong> 🏆 ${ganadorNombre}</p>`;
                }
            } else {
                const jugadorTurno = partida.turnoActual === 1 ? partida.jugador1.nombre : partida.jugador2.nombre;
                infoAdicional = `<p><strong>Turno de:</strong> ${jugadorTurno}</p>`;
            }
            
            div.innerHTML = `
                <div class="info-partida">
                    <h4>Partida #${partida.id}</h4>
                    <p><strong>Jugadores:</strong> ${partida.jugador1.nombre} vs ${partida.jugador2.nombre}</p>
                    <p><strong>Estado:</strong> ${partida.estado === 'en_curso' ? '🎮 En curso' : '✅ Finalizada'}</p>
                    ${infoAdicional}
                    <p><strong>Fecha:</strong> ${new Date(partida.fechaCreacion).toLocaleDateString()} ${new Date(partida.fechaCreacion).toLocaleTimeString()}</p>
                </div>
                <div class="acciones-partida">
                    ${partida.estado === 'en_curso' 
                        ? `<button onclick="cargarPartida(${partida.id})" class="btn btn-primary">▶️ Continuar</button>`
                        : `<button onclick="verPartida(${partida.id})" class="btn btn-secondary">👁️ Ver</button>`
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
                    <p>❌ Error al cargar las partidas: ${error.message}</p>
                    <button onclick="cargarPartidasExistentes()" class="btn btn-warning">🔄 Reintentar</button>
                </div>
            `;
        }
    } finally {
        mostrarLoading(false);
    }
}

// Función para cargar una partida específica (continuar)
async function cargarPartida(partidaId) {
    try {
        mostrarLoading(true);
        
        const partida = await obtenerPartidaPorId(partidaId);
        
        // Verificar que la partida esté en curso
        if (partida.estado !== 'en_curso') {
            mostrarMensaje('mensaje-partida', 
                'Esta partida ya ha finalizado. Use "Ver" para revisarla.', 'error');
            return;
        }
        
        iniciarJuego(partida);
        
    } catch (error) {
        console.error('Error al cargar partida:', error);
        mostrarMensaje('mensaje-partida', 
            `Error al cargar partida: ${error.message}`, 'error');
    } finally {
        mostrarLoading(false);
    }
}

// Función para ver una partida finalizada (modo solo lectura)
async function verPartida(partidaId) {
    try {
        mostrarLoading(true);
        
        const partida = await obtenerPartidaPorId(partidaId);
        
        // Cargar jugadores
        const jugador1 = await obtenerJugadorPorId(partida.jugador1Id);
        const jugador2 = await obtenerJugadorPorId(partida.jugador2Id);
        
        // Actualizar información de jugadores
        document.getElementById('nombre-jugador1').textContent = jugador1.nombre;
        document.getElementById('nombre-jugador2').textContent = jugador2.nombre;
        
        // Configurar tablero
        inicializarTablero();
        
        // Cargar tablero desde la partida
        if (partida.tablero && partida.tablero !== '[]') {
            cargarTableroDesdePartida(partida.tablero);
        }
        
        // Deshabilitar todos los botones de columna (modo solo lectura)
        const botones = document.querySelectorAll('.btn-columna');
        botones.forEach(boton => {
            boton.disabled = true;
            boton.textContent = boton.textContent + ' 🔒';
        });
        
        // Mostrar resultado final
        const divResultado = document.getElementById('resultado-juego');
        let mensaje = '';
        let clase = '';
        
        if (partida.resultado === 'empate') {
            mensaje = '🤝 Esta partida terminó en EMPATE';
            clase = 'empate';
        } else {
            const ganadorNombre = partida.ganadorId === partida.jugador1Id ? jugador1.nombre : jugador2.nombre;
            mensaje = `🏆 ${ganadorNombre} ganó esta partida`;
            clase = 'ganador';
        }
        
        if (divResultado) {
            divResultado.innerHTML = `
                <div class="resultado-final ${clase}">
                    <h3>${mensaje}</h3>
                    <p><em>Partida finalizada el ${new Date(partida.fechaActualizacion).toLocaleDateString()}</em></p>
                    <div class="botones-resultado">
                        <button onclick="mostrarCargarPartida()" class="btn btn-primary">
                            ← Volver a Partidas
                        </button>
                        <button onclick="mostrarEscalafon()" class="btn btn-secondary">
                            🏆 Ver Escalafón
                        </button>
                        <button onclick="reiniciarConMismosJugadores(${partida.jugador1Id}, ${partida.jugador2Id})" class="btn btn-success">
                            🔄 Nueva Partida con Mismos Jugadores
                        </button>
                    </div>
                </div>
            `;
        }
        
        // Actualizar indicador de turno para mostrar que la partida terminó
        const spanTurno = document.getElementById('jugador-turno');
        if (spanTurno) {
            spanTurno.textContent = 'Partida finalizada';
            spanTurno.className = 'finalizada';
        }
        
        // Mostrar pantalla de juego
        mostrarJuego();
        
    } catch (error) {
        console.error('Error al ver partida:', error);
        mostrarMensaje('mensaje-partida', 
            `Error al cargar partida: ${error.message}`, 'error');
    } finally {
        mostrarLoading(false);
    }
}



// ===== MODAL DE RESULTADO DE PARTIDA =====

// Función para mostrar el modal de resultado
function mostrarModalResultado(resultado) {
    console.log('🏆 Mostrando modal de resultado:', resultado);
    
    // Obtener elementos del modal
    const modal = document.getElementById('modal-resultado-partida');
    const headerModal = modal.querySelector('.modal-header-resultado');
    const trofeoIcono = document.getElementById('trofeo-icono');
    const tituloResultado = document.getElementById('titulo-resultado');
    const mensajeResultado = document.getElementById('mensaje-resultado');
    const jugador1Nombre = document.getElementById('resultado-jugador1');
    const jugador2Nombre = document.getElementById('resultado-jugador2');
    const estado1 = document.getElementById('estado-jugador1');
    const estado2 = document.getElementById('estado-jugador2');
    const estadisticasPartida = document.getElementById('estadisticas-partida');
    
    // Obtener nombres de los jugadores
    const nombreJugador1 = document.getElementById('nombre-jugador1').textContent;
    const nombreJugador2 = document.getElementById('nombre-jugador2').textContent;
    
    // Llenar nombres
    jugador1Nombre.textContent = nombreJugador1;
    jugador2Nombre.textContent = nombreJugador2;
    
    let mensaje = '';
    let titulo = '';
    let tipoResultado = '';
    
    // Verificar si es empate
    if (resultado.esEmpate || resultado.datos?.resultado === 'empate') {
        tipoResultado = 'empate';
        titulo = '¡Partida Empatada!';
        mensaje = 'Ambos jugadores demostraron gran habilidad. ¡Es un empate!';
        trofeoIcono.textContent = '🤝';
        
        // Estados para empate
        estado1.textContent = 'Empate';
        estado1.className = 'estado-jugador empate';
        estado2.textContent = 'Empate';
        estado2.className = 'estado-jugador empate';
        
    } else {
        // Determinar ganador
        const ganadorId = resultado.ganador || resultado.datos?.ganadorId;
        const nombreGanador = ganadorId === partidaActual.jugador1Id ? nombreJugador1 : nombreJugador2;
        
        tipoResultado = 'victoria';
        titulo = '¡Tenemos un Ganador!';
        mensaje = `🎉 ¡Felicidades ${nombreGanador}! Has demostrado ser superior en esta partida de Connect4.`;
        trofeoIcono.textContent = '🏆';
        
        // Estados para victoria
        if (ganadorId === partidaActual.jugador1Id) {
            estado1.textContent = 'Ganador';
            estado1.className = 'estado-jugador ganador';
            estado2.textContent = 'Perdedor';
            estado2.className = 'estado-jugador perdedor';
        } else {
            estado1.textContent = 'Perdedor';
            estado1.className = 'estado-jugador perdedor';
            estado2.textContent = 'Ganador';
            estado2.className = 'estado-jugador ganador';
        }
    }
    
    // Aplicar clases CSS según el tipo de resultado
    headerModal.className = `modal-header-resultado ${tipoResultado}`;
    trofeoIcono.className = `trofeo-icono ${tipoResultado}`;
    mensajeResultado.className = `mensaje-resultado ${tipoResultado}`;
    
    // Llenar contenido
    tituloResultado.textContent = titulo;
    mensajeResultado.textContent = mensaje;
    
    // Llenar estadísticas (opcional)
    const fechaHora = new Date().toLocaleString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    estadisticasPartida.innerHTML = `
        <div><strong>📅 Fecha:</strong> ${fechaHora}</div>
        <div><strong>🎮 Partida:</strong> Connect4 - 7x6</div>
        <div><strong>⚡ Duración:</strong> Partida completada</div>
    `;
    
    // Mostrar modal
    modal.classList.add('activo');
    document.body.style.overflow = 'hidden';
    
    // Configurar scroll del modal
    setTimeout(() => {
        const modalBody = modal.querySelector('.modal-body');
        if (modalBody) {
            const needsScroll = modalBody.scrollHeight > modalBody.clientHeight;
            if (needsScroll) {
                modalBody.classList.add('has-scroll');
            }
        }
    }, 100);
    
    // Log para debugging
    console.log(`🎯 Resultado mostrado: ${tipoResultado}`, {
        ganador: resultado.ganador || resultado.datos?.ganadorId,
        jugador1: partidaActual.jugador1Id,
        jugador2: partidaActual.jugador2Id
    });
}

// Función para cerrar el modal de resultado
function cerrarModalResultado() {
    const modal = document.getElementById('modal-resultado-partida');
    modal.classList.remove('activo');
    document.body.style.overflow = 'auto';
}

// Función para jugar de nuevo
function jugarDeNuevo() {
    if (!partidaActual) {
        console.error('No hay partida actual para reiniciar');
        return;
    }
    
    cerrarModalResultado();
    
    // Reiniciar la partida actual
    reiniciarPartida();
}

// Función para cerrar modal e ir al menú principal
function cerrarModalResultadoYMenuPrincipal() {
    cerrarModalResultado();
    mostrarMenuPrincipal();
}

// Función para cerrar modal e ir al escalafón
function cerrarModalResultadoYEscalafon() {
    cerrarModalResultado();
    mostrarEscalafon();
}

// Manejar tecla Escape para cerrar modal de resultado
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modalResultado = document.getElementById('modal-resultado-partida');
        if (modalResultado && modalResultado.classList.contains('activo')) {
            event.stopPropagation();
            cerrarModalResultadoYMenuPrincipal(); // Al presionar Escape, ir al menú
        }
    }
});

// Manejar click en overlay para cerrar modal de resultado
document.addEventListener('click', function(event) {
    const modalResultado = document.getElementById('modal-resultado-partida');
    if (event.target === modalResultado && modalResultado.classList.contains('activo')) {
        cerrarModalResultadoYMenuPrincipal(); // Al hacer click fuera, ir al menú
    }
});
