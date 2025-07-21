// ===== NAVEGACIÓN PRINCIPAL =====

// Variables globales
let partidaActual = null;

// Función para mostrar/ocultar pantallas
function mostrarPantalla(idPantalla) {
    console.log(`📱 Cambiando a pantalla: ${idPantalla}`);
    
    // Ocultar todas las pantallas
    const pantallas = document.querySelectorAll('.pantalla');
    console.log(`🔍 Encontradas ${pantallas.length} pantallas`);
    
    pantallas.forEach((pantalla, index) => {
        pantalla.classList.remove('activa');
        console.log(`❌ Ocultando pantalla ${index + 1}: ${pantalla.id}`);
    });
    
    // Mostrar la pantalla solicitada
    const pantallaActiva = document.getElementById(idPantalla);
    if (pantallaActiva) {
        pantallaActiva.classList.add('activa');
        console.log(`✅ Mostrando pantalla: ${idPantalla}`);
    } else {
        console.error(`❌ ERROR: No se encontró la pantalla con ID: ${idPantalla}`);
    }
}

// Funciones de navegación
function mostrarMenuPrincipal() {
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
    cargarJugadoresEnSelectores();
    limpiarFormularioPartida();
}

function mostrarCargarPartida() {
    mostrarPantalla('cargar-partida');
    cargarPartidasExistentes();
}

function mostrarEscalafon() {
    mostrarPantalla('escalafon');
    cargarEscalafon();
}

function mostrarJuego() {
    mostrarPantalla('juego');
}

// Función para mostrar/ocultar loading
function mostrarLoading(mostrar = true) {
    const loading = document.getElementById('loading');
    if (mostrar) {
        loading.style.display = 'flex';
    } else {
        loading.style.display = 'none';
    }
}

// Función para mostrar mensajes
function mostrarMensaje(contenedor, mensaje, tipo = 'info') {
    const elemento = document.getElementById(contenedor);
    if (elemento) {
        elemento.innerHTML = `<div class="mensaje ${tipo}">${mensaje}</div>`;
        setTimeout(() => {
            elemento.innerHTML = '';
        }, 5000);
    }
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando aplicación Connect4...');
    
    // Configurar event listeners para los botones del menú
    configurarEventListeners();
    
    // Configurar formularios
    configurarFormularios();
    
    // Mostrar menú principal
    mostrarMenuPrincipal();
    
    console.log('✅ Aplicación Connect4 inicializada correctamente');
});

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
