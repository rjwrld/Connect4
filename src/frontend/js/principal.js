// ===== NAVEGACIÓN PRINCIPAL =====

// Variables globales
let partidaActual = null;
let intervalConexion = null;
let historialPantallas = ['menu-principal']; // Historial de pantallas visitadas
let pantallaAnterior = null;

// Función para mostrar/ocultar pantallas con historial
function mostrarPantalla(idPantalla, registrarEnHistorial = true) {
    console.log(`📱 Cambiando a pantalla: ${idPantalla}`);
    
    // Guardar pantalla anterior
    const pantallaActual = document.querySelector('.pantalla.activa');
    if (pantallaActual && registrarEnHistorial) {
        pantallaAnterior = pantallaActual.id;
        
        // Agregar al historial si no es la misma pantalla
        if (historialPantallas[historialPantallas.length - 1] !== idPantalla) {
            historialPantallas.push(idPantalla);
            
            // Mantener historial limitado (máximo 10 pantallas)
            if (historialPantallas.length > 10) {
                historialPantallas.shift();
            }
        }
    }
    
    // Ocultar todas las pantallas
    const pantallas = document.querySelectorAll('.pantalla');
    console.log(`🔍 Encontradas ${pantallas.length} pantallas`);
    
    pantallas.forEach((pantalla, index) => {
        pantalla.classList.remove('activa');
        console.log(`❌ Ocultando pantalla ${index + 1}: ${pantalla.id}`);
    });
    
    // Mostrar la pantalla solicitada
    const pantallaDestino = document.getElementById(idPantalla);
    if (pantallaDestino) {
        pantallaDestino.classList.add('activa');
        console.log(`✅ Mostrando pantalla: ${idPantalla}`);
        
        // Actualizar breadcrumb si existe
        actualizarBreadcrumb(idPantalla);
        
        // Scroll al inicio de la pantalla
        window.scrollTo(0, 0);
    } else {
        console.error(`❌ ERROR: No se encontró la pantalla con ID: ${idPantalla}`);
    }
}

// Función para regresar a la pantalla anterior
function regresarPantallaAnterior() {
    console.log('🔙 Regresando a pantalla anterior...');
    console.log('📚 Historial actual:', historialPantallas);
    
    // Si hay al menos 2 pantallas en el historial
    if (historialPantallas.length >= 2) {
        // Remover la pantalla actual del historial
        historialPantallas.pop();
        
        // Obtener la pantalla anterior
        const pantallaAnterior = historialPantallas[historialPantallas.length - 1];
        
        console.log(`🎯 Regresando a: ${pantallaAnterior}`);
        
        // Mostrar pantalla anterior sin registrar en historial
        mostrarPantalla(pantallaAnterior, false);
        
        // Ejecutar acciones específicas según la pantalla de destino
        ejecutarAccionesPantalla(pantallaAnterior);
    } else {
        // Si no hay historial, ir al menú principal
        console.log('🏠 No hay historial, regresando al menú principal');
        mostrarMenuPrincipal();
    }
}

// Función para ejecutar acciones específicas al regresar a una pantalla
function ejecutarAccionesPantalla(idPantalla) {
    switch (idPantalla) {
        case 'crear-partida':
            // Recargar jugadores si regresamos a crear partida
            setTimeout(async () => {
                try {
                    await cargarJugadoresEnSelectores();
                } catch (error) {
                    console.warn('Error al recargar jugadores:', error);
                }
            }, 100);
            break;
            
        case 'cargar-partida':
            // Recargar partidas si regresamos a cargar partida
            setTimeout(async () => {
                try {
                    await cargarPartidasExistentes();
                } catch (error) {
                    console.warn('Error al recargar partidas:', error);
                }
            }, 100);
            break;
            
        case 'escalafon':
            // Recargar escalafón si regresamos
            setTimeout(async () => {
                try {
                    await cargarEscalafon();
                } catch (error) {
                    console.warn('Error al recargar escalafón:', error);
                }
            }, 100);
            break;
            
        default:
            // No hacer nada especial para otras pantallas
            break;
    }
}

// Función para actualizar breadcrumb (migajas de pan)
function actualizarBreadcrumb(pantallaActual) {
    // Crear breadcrumb en pantallas que lo soporten
    const breadcrumbContainer = document.querySelector('.breadcrumb');
    if (!breadcrumbContainer) return;
    
    const nombresPantallas = {
        'menu-principal': '🏠 Inicio',
        'crear-jugador': '👤 Crear Jugador',
        'crear-partida': '🎮 Crear Partida',
        'cargar-partida': '📂 Cargar Partida',
        'escalafon': '🏆 Escalafón',
        'juego': '🎯 Jugando'
    };
    
    let breadcrumbHTML = '';
    historialPantallas.forEach((pantalla, index) => {
        const nombre = nombresPantallas[pantalla] || pantalla;
        const esUltima = index === historialPantallas.length - 1;
        
        if (index > 0) {
            breadcrumbHTML += '<span class="breadcrumb-separator">›</span>';
        }
        
        breadcrumbHTML += `<span class="breadcrumb-item ${esUltima ? 'breadcrumb-current' : ''}">${nombre}</span>`;
    });
    
    breadcrumbContainer.innerHTML = breadcrumbHTML;
}

// Función para limpiar historial
function limpiarHistorial() {
    historialPantallas = ['menu-principal'];
    pantallaAnterior = null;
}

// Funciones de navegación actualizadas
function mostrarMenuPrincipal() {
    limpiarHistorial(); // Limpiar historial al volver al menú principal
    mostrarPantalla('menu-principal');
}

function mostrarCrearJugador() {
    mostrarPantalla('crear-jugador');
    limpiarFormularioJugador();
    // Configurar búsqueda automática de nombre
    setTimeout(() => {
        configurarBusquedaAutomatica();
    }, 100);
}

function mostrarCrearPartida() {
    mostrarPantalla('crear-partida');
    
    // Cargar jugadores con verificación de conexión
    setTimeout(async () => {
        try {
            await cargarJugadoresEnSelectores();
        } catch (error) {
            mostrarMensaje('mensaje-partida', 
                'Error al cargar jugadores. Verifica tu conexión.', 'error');
        }
    }, 100);
    
    limpiarFormularioPartida();
}

function mostrarCargarPartida() {
    mostrarPantalla('cargar-partida');
    
    // Cargar partidas con verificación de conexión
    setTimeout(async () => {
        try {
            await cargarPartidasExistentes();
        } catch (error) {
            mostrarMensajeGeneral(
                'Error al cargar partidas. Verifica tu conexión con el servidor.', 
                'error'
            );
        }
    }, 100);
}

function mostrarEscalafon() {
    mostrarPantalla('escalafon');
    
    // Cargar escalafón con verificación de conexión
    setTimeout(async () => {
        try {
            await cargarEscalafon();
        } catch (error) {
            mostrarMensajeGeneral(
                'Error al cargar escalafón. Verifica tu conexión con el servidor.', 
                'error'
            );
        }
    }, 100);
}

function mostrarJuego() {
    mostrarPantalla('juego');
}

// Función para manejar navegación con teclado
document.addEventListener('keydown', function(event) {
    // Alt + Flecha izquierda = Regresar
    if (event.altKey && event.key === 'ArrowLeft') {
        event.preventDefault();
        regresarPantallaAnterior();
    }
    
    // Escape = Regresar (si no hay modales abiertos)
    if (event.key === 'Escape') {
        const modalesAbiertos = document.querySelectorAll('.modal-overlay.activo');
        if (modalesAbiertos.length === 0) {
            // Solo regresar si no estamos en el menú principal
            const pantallaActual = document.querySelector('.pantalla.activa');
            if (pantallaActual && pantallaActual.id !== 'menu-principal') {
                regresarPantallaAnterior();
            }
        }
    }
});

// Función para mostrar/ocultar loading
function mostrarLoading(mostrar = true, mensaje = 'Cargando...') {
    const loading = document.getElementById('loading');
    const textoLoading = loading.querySelector('p');
    
    if (mostrar) {
        if (textoLoading) {
            textoLoading.textContent = mensaje;
        }
        loading.style.display = 'flex';
    } else {
        loading.style.display = 'none';
        if (textoLoading) {
            textoLoading.textContent = 'Cargando...';
        }
    }
}

// Función para mostrar mensajes
function mostrarMensaje(contenedor, mensaje, tipo = 'info', duracion = 5000) {
    const elemento = document.getElementById(contenedor);
    if (elemento) {
        // Limpiar mensajes anteriores
        elemento.innerHTML = '';
        
        const divMensaje = document.createElement('div');
        divMensaje.className = `mensaje ${tipo}`;
        divMensaje.innerHTML = `
            ${mensaje}
            <button onclick="this.parentElement.remove()" style="float: right; background: none; border: none; font-size: 18px; cursor: pointer;">&times;</button>
        `;
        
        elemento.appendChild(divMensaje);
        
        // Auto-ocultar después del tiempo especificado
        if (duracion > 0) {
            setTimeout(() => {
                if (divMensaje.parentElement) {
                    divMensaje.remove();
                }
            }, duracion);
        }
    }
}

// Función para agregar mensaje general al header (para errores de conexión)
function mostrarMensajeGeneral(mensaje, tipo = 'info', duracion = 8000) {
    const header = document.querySelector('.header');
    if (!header) return;
    
    // Remover mensajes anteriores
    const mensajeAnterior = header.querySelector('.mensaje-general');
    if (mensajeAnterior) {
        mensajeAnterior.remove();
    }
    
    const divMensaje = document.createElement('div');
    divMensaje.className = `mensaje-general mensaje ${tipo}`;
    divMensaje.style.cssText = `
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 1000;
        max-width: 90%;
        padding: 10px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    `;
    divMensaje.innerHTML = `
        ${mensaje}
        <button onclick="this.parentElement.remove()" style="float: right; background: none; border: none; font-size: 16px; cursor: pointer; color: inherit;">&times;</button>
    `;
    
    header.appendChild(divMensaje);
    
    if (duracion > 0) {
        setTimeout(() => {
            if (divMensaje.parentElement) {
                divMensaje.remove();
            }
        }, duracion);
    }
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando aplicación Connect4...');
    
    // Configurar event listeners para los botones del menú
    configurarEventListeners();
    
    // Configurar formularios
    configurarFormularios();
    
    // Verificar conexión inicial
    verificarConexionInicial();
    
    // Configurar monitoreo de conexión
    configurarMonitoreoConexion();
    
    // Mostrar menú principal
    mostrarMenuPrincipal();
    
    console.log('✅ Aplicación Connect4 inicializada correctamente');
});

// Función para verificar conexión inicial
async function verificarConexionInicial() {
    try {
        mostrarLoading(true, 'Verificando conexión con el servidor...');
        
        const conectado = await verificarConexionServidor();
        mostrarEstadoConexion(conectado);
        
        if (!conectado) {
            mostrarMensaje('mensaje-general', 
                '⚠️ No se pudo conectar con el servidor. Algunas funciones pueden no estar disponibles.', 
                'error');
        } else {
            console.log('🌐 Conexión con servidor establecida correctamente');
        }
        
    } catch (error) {
        console.error('Error al verificar conexión inicial:', error);
        mostrarEstadoConexion(false);
    } finally {
        mostrarLoading(false);
    }
}

// Función para configurar monitoreo de conexión en segundo plano
function configurarMonitoreoConexion() {
    // Verificar conexión cada 30 segundos
    intervalConexion = setInterval(async () => {
        const conectado = await verificarConexionServidor();
        mostrarEstadoConexion(conectado);
    }, 30000);
    
    // Limpiar interval al cerrar la página
    window.addEventListener('beforeunload', () => {
        if (intervalConexion) {
            clearInterval(intervalConexion);
        }
    });
}

function configurarEventListeners() {
    // Botón del header
    const btnMenuHeader = document.getElementById('btn-menu-header');
    
    // Botones del menú principal
    const btnCrearJugador = document.getElementById('btn-crear-jugador');
    const btnCrearPartida = document.getElementById('btn-crear-partida');
    const btnCargarPartida = document.getElementById('btn-cargar-partida');
    const btnEscalafon = document.getElementById('btn-escalafon');
    
    // Botones de navegación (Cancelar/Volver)
    const btnCancelarJugador = document.getElementById('btn-cancelar-jugador');
    const btnCancelarPartida = document.getElementById('btn-cancelar-partida');
    const btnVolverCargar = document.getElementById('btn-volver-cargar');
    const btnVolverEscalafon = document.getElementById('btn-volver-escalafon');
    
    // Event listener para el botón del header
    if (btnMenuHeader) {
        btnMenuHeader.addEventListener('click', function() {
            console.log('🏠 Navegando al menú principal desde header');
            mostrarMenuPrincipal();
        });
    }
    
    if (btnCrearJugador) {
        btnCrearJugador.addEventListener('click', function() {
            console.log('👤 Navegando a Crear Jugador');
            mostrarCrearJugador();
        });
    }
    
    if (btnCrearPartida) {
        btnCrearPartida.addEventListener('click', function() {
            console.log('🎮 Navegando a Crear Partida');
            mostrarCrearPartida();
        });
    }
    
    if (btnCargarPartida) {
        btnCargarPartida.addEventListener('click', function() {
            console.log('📂 Navegando a Cargar Partida');
            mostrarCargarPartida();
        });
    }
    
    if (btnEscalafon) {
        btnEscalafon.addEventListener('click', function() {
            console.log('🏆 Navegando a Escalafón');
            mostrarEscalafon();
        });
    }
    
    // Event listeners para botones de regreso
    if (btnCancelarJugador) {
        btnCancelarJugador.addEventListener('click', function() {
            console.log('🔙 Cancelando creación de jugador');
            mostrarMenuPrincipal();
        });
    }
    
    if (btnCancelarPartida) {
        btnCancelarPartida.addEventListener('click', function() {
            console.log('🔙 Cancelando creación de partida');
            mostrarMenuPrincipal();
        });
    }
    
    if (btnVolverCargar) {
        btnVolverCargar.addEventListener('click', function() {
            console.log('🔙 Volviendo al menú desde Cargar Partida');
            mostrarMenuPrincipal();
        });
    }
    
    if (btnVolverEscalafon) {
        btnVolverEscalafon.addEventListener('click', function() {
            console.log('🔙 Volviendo al menú desde Escalafón');
            mostrarMenuPrincipal();
        });
    }
    
    console.log('✅ Event listeners configurados');
}

function configurarFormularios() {
    // Formulario crear jugador
    const formJugador = document.getElementById('form-crear-jugador');
    if (formJugador) {
        formJugador.addEventListener('submit', manejarCrearJugador);
    }
    
    // Formulario crear partida
    const formPartida = document.getElementById('form-crear-partida');
    if (formPartida) {
        formPartida.addEventListener('submit', manejarCrearPartida);
    }
}
