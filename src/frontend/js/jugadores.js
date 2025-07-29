// ===== GESTIÓN DE JUGADORES =====

// Variable global para almacenar datos del jugador pendiente
let jugadorPendiente = null;

// Función para consultar nombre por identificación
async function consultarNombre(identificacion) {
    console.log(`🔍 Consultando nombre para identificación: ${identificacion}`);
    
    try {
        // Usar la API del backend en lugar de la API externa
        const url = `/api/consultar-nombre/${identificacion}`;
        console.log(`📡 URL de consulta (backend): ${url}`);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log(`📊 Response status: ${response.status}`);
        
        if (response.ok) {
            const data = await response.json();
            console.log(`✅ Datos recibidos:`, data);
            
            if (data.exito && data.datos && data.datos.nombre) {
                return data.datos.nombre;
            } else {
                console.warn(`⚠️ No se encontró nombre en la respuesta:`, data);
                return null;
            }
        } else {
            console.warn(`⚠️ Response no exitoso: ${response.status} - ${response.statusText}`);
            const errorData = await response.json().catch(() => ({}));
            console.warn(`⚠️ Error data:`, errorData);
            return null;
        }
    } catch (error) {
        console.error('❌ Error completo al consultar nombre:', error);
        console.error('❌ Error name:', error.name);
        console.error('❌ Error message:', error.message);
        return null;
    }
}

// Función para configurar la búsqueda automática de nombre
function configurarBusquedaAutomatica() {
    const inputIdentificacion = document.getElementById('identificacion');
    const inputNombre = document.getElementById('nombre');
    
    if (inputIdentificacion && inputNombre) {
        // Agregar evento para cuando se termine de escribir la identificación
        let timeoutId;
        
        inputIdentificacion.addEventListener('input', function() {
            const identificacion = this.value.trim();
            
            // Limpiar el timeout anterior
            clearTimeout(timeoutId);
            
            // Limpiar el campo de nombre
            inputNombre.value = '';
            inputNombre.placeholder = 'Se llenará automáticamente...';
            
            // Si la identificación tiene al menos 9 dígitos, buscar el nombre
            if (identificacion.length >= 9) {
                inputNombre.placeholder = 'Buscando nombre...';
                
                // Esperar 500ms después de que el usuario deje de escribir
                timeoutId = setTimeout(async () => {
                    const nombre = await consultarNombre(identificacion);
                    
                    if (nombre) {
                        inputNombre.value = nombre;
                        inputNombre.placeholder = 'Nombre obtenido automáticamente';
                        inputNombre.style.backgroundColor = '#f0f9ff';
                        console.log(`✅ Nombre encontrado: ${nombre}`);
                    } else {
                        inputNombre.placeholder = 'Nombre no encontrado - Ingrese manualmente';
                        inputNombre.style.backgroundColor = '#fef2f2';
                        inputNombre.removeAttribute('readonly');
                        console.log('⚠️ Nombre no encontrado, permitir ingreso manual');
                    }
                }, 500);
            } else {
                inputNombre.placeholder = 'Ingrese al menos 9 dígitos en la identificación';
                inputNombre.style.backgroundColor = '';
            }
        });
        
        // Permitir edición manual del nombre si el usuario hace clic en él
        inputNombre.addEventListener('focus', function() {
            if (this.hasAttribute('readonly')) {
                const confirmar = confirm('¿Desea editar el nombre manualmente?');
                if (confirmar) {
                    this.removeAttribute('readonly');
                    this.style.backgroundColor = '';
                    this.placeholder = 'Ingrese nombre completo';
                }
            }
        });
    }
}

// Función para manejar el formulario de crear jugador
async function manejarCrearJugador(evento) {
    evento.preventDefault();
    
    const form = evento.target;
    const formData = new FormData(form);
    
    const datosJugador = {
        identificacion: formData.get('identificacion'),
        nombre: formData.get('nombre').trim()
    };
    
    // Validaciones básicas
    if (!datosJugador.identificacion || !datosJugador.nombre) {
        mostrarMensaje('mensaje-jugador', 'Todos los campos son requeridos', 'error');
        return;
    }
    
    if (datosJugador.identificacion.length < 9) {
        mostrarMensaje('mensaje-jugador', 'La identificación debe tener al menos 9 dígitos', 'error');
        return;
    }
    
    if (datosJugador.nombre.length < 2) {
        mostrarMensaje('mensaje-jugador', 'El nombre debe tener al menos 2 caracteres', 'error');
        return;
    }
    
    // Determinar la fuente del nombre
    const inputNombre = document.getElementById('nombre');
    const esNombreAutomatico = inputNombre.hasAttribute('readonly') && 
                              inputNombre.style.backgroundColor === 'rgb(240, 249, 255)';
    
    // Guardar datos para confirmación
    jugadorPendiente = {
        ...datosJugador,
        fuenteNombre: esNombreAutomatico ? 'automatica' : 'manual'
    };
    
    // Mostrar modal de confirmación
    mostrarModalConfirmacion();
}

// Función para mostrar el modal de confirmación
function mostrarModalConfirmacion() {
    if (!jugadorPendiente) return;
    
    // Llenar datos en el modal
    document.getElementById('modal-identificacion').textContent = jugadorPendiente.identificacion;
    document.getElementById('modal-nombre').textContent = jugadorPendiente.nombre;
    
    const fuenteElement = document.getElementById('modal-fuente');
    if (jugadorPendiente.fuenteNombre === 'automatica') {
        fuenteElement.textContent = '🤖 Obtenido automáticamente';
        fuenteElement.className = 'fuente-automatica';
    } else {
        fuenteElement.textContent = '✏️ Ingresado manualmente';
        fuenteElement.className = 'fuente-manual';
    }
    
    // Mostrar modal
    const modal = document.getElementById('modal-confirmar-jugador');
    modal.classList.add('activo');
    
    // Prevenir scroll del body
    document.body.style.overflow = 'hidden';
    
    // Configurar scroll del modal
    configurarScrollModal('modal-confirmar-jugador');
}

// Función para cerrar el modal de confirmación
function cerrarModalConfirmacion() {
    const modal = document.getElementById('modal-confirmar-jugador');
    modal.classList.remove('activo');
    
    // Restaurar scroll del body
    document.body.style.overflow = 'auto';
    
    // Limpiar datos pendientes
    jugadorPendiente = null;
}

// Función para confirmar la creación del jugador
async function confirmarCrearJugador() {
    if (!jugadorPendiente) {
        cerrarModalConfirmacion();
        return;
    }
    
    // Guardar datos antes de cerrar el modal (para evitar que se pierdan)
    const datosJugador = {
        identificacion: jugadorPendiente.identificacion,
        nombre: jugadorPendiente.nombre
    };
    
    try {
        // Cerrar modal
        cerrarModalConfirmacion();
        
        mostrarLoading(true, 'Creando jugador...');
        
        // Crear el jugador usando los datos guardados
        const jugadorCreado = await crearJugador(datosJugador);
        
        // Limpiar formulario
        const form = document.getElementById('form-crear-jugador');
        if (form) {
            form.reset();
            limpiarFormularioJugador();
        }
        
        // Mostrar modal de éxito con los datos del jugador creado
        mostrarModalExito(jugadorCreado);
        
    } catch (error) {
        console.error('Error al crear jugador:', error);
        mostrarLoading(false);
        
        // Mostrar error en el formulario
        mostrarMensaje('mensaje-jugador', 
            `❌ Error: ${error.message}`, 'error');
            
        // Limpiar datos pendientes en caso de error también
        jugadorPendiente = null;
    }
}

// Función para cerrar modal con tecla Escape
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modal = document.getElementById('modal-confirmar-jugador');
        if (modal && modal.classList.contains('activo')) {
            event.stopPropagation(); // Prevenir que se ejecute la navegación
            cerrarModalConfirmacion();
        }
    }
});

// Función para cerrar modal al hacer click en el overlay
document.addEventListener('click', function(event) {
    const modal = document.getElementById('modal-confirmar-jugador');
    if (event.target === modal && modal.classList.contains('activo')) {
        cerrarModalConfirmacion();
    }
});

// ===== MODAL DE ÉXITO =====

// Variable para controlar el countdown
let countdownInterval = null;

// Función para mostrar el modal de éxito
function mostrarModalExito(jugadorCreado) {
    console.log('🎉 Mostrando modal de éxito para jugador:', jugadorCreado);
    
    // Detener loading
    mostrarLoading(false);
    
    // Limpiar datos pendientes (ya se usaron exitosamente)
    jugadorPendiente = null;
    
    // Llenar datos en el modal
    document.getElementById('exito-nombre').textContent = jugadorCreado.nombre;
    document.getElementById('exito-identificacion').textContent = jugadorCreado.identificacion;
    document.getElementById('exito-marcador').textContent = jugadorCreado.marcador || 0;
    
    // Mostrar modal
    const modal = document.getElementById('modal-exito-jugador');
    modal.classList.add('activo');
    
    // Prevenir scroll del body
    document.body.style.overflow = 'hidden';
    
    // Configurar scroll del modal
    configurarScrollModal('modal-exito-jugador');
    
    // Iniciar countdown automático
    iniciarCountdown();
}

// Función para cerrar el modal de éxito
function cerrarModalExito() {
    const modal = document.getElementById('modal-exito-jugador');
    modal.classList.remove('activo');
    
    // Restaurar scroll del body
    document.body.style.overflow = 'auto';
    
    // Limpiar countdown si existe
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
}

// Función para iniciar countdown automático
function iniciarCountdown() {
    let segundos = 3;
    const countdownElement = document.getElementById('countdown');
    
    // Actualizar inmediatamente
    countdownElement.textContent = segundos;
    
    // Crear intervalo para countdown
    countdownInterval = setInterval(() => {
        segundos--;
        countdownElement.textContent = segundos;
        
        if (segundos <= 0) {
            clearInterval(countdownInterval);
            countdownInterval = null;
            // Ir automáticamente al menú principal
            irAlMenuPrincipal();
        }
    }, 1000);
}

// Función para ir al menú principal
function irAlMenuPrincipal() {
    cerrarModalExito();
    mostrarMenuPrincipal();
}

// Función para crear otro jugador
function crearOtroJugador() {
    cerrarModalExito();
    // No hacer nada más, quedarse en la pantalla de crear jugador
    // Solo resetear el countdown
    document.getElementById('countdown').textContent = '3';
    
    // Opcional: limpiar mensajes previos
    const mensajes = document.getElementById('mensaje-jugador');
    if (mensajes) {
        mensajes.innerHTML = '';
    }
}

// Manejar tecla Escape para cerrar modal de éxito
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modalExito = document.getElementById('modal-exito-jugador');
        if (modalExito && modalExito.classList.contains('activo')) {
            event.stopPropagation();
            irAlMenuPrincipal(); // Al presionar Escape, ir al menú
        }
    }
});

// Manejar click en overlay para cerrar modal de éxito
document.addEventListener('click', function(event) {
    const modalExito = document.getElementById('modal-exito-jugador');
    if (event.target === modalExito && modalExito.classList.contains('activo')) {
        irAlMenuPrincipal(); // Al hacer click fuera, ir al menú
    }
});

// ===== UTILIDADES PARA SCROLL EN MODALES =====

// Función para detectar si un modal necesita scroll
function detectarScrollModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    const modalBody = modal.querySelector('.modal-body');
    if (!modalBody) return;
    
    // Verificar si el contenido desborda
    const needsScroll = modalBody.scrollHeight > modalBody.clientHeight;
    
    if (needsScroll) {
        modalBody.classList.add('has-scroll');
    } else {
        modalBody.classList.remove('has-scroll');
    }
}

// Observer para detectar cambios en el contenido de los modales
const modalObserver = new ResizeObserver(function(entries) {
    entries.forEach(entry => {
        const modalBody = entry.target;
        const modal = modalBody.closest('.modal-overlay');
        
        if (modal && modal.classList.contains('activo')) {
            const needsScroll = modalBody.scrollHeight > modalBody.clientHeight;
            
            if (needsScroll) {
                modalBody.classList.add('has-scroll');
            } else {
                modalBody.classList.remove('has-scroll');
            }
        }
    });
});

// Aplicar observer a todos los modal-body existentes
document.addEventListener('DOMContentLoaded', function() {
    const modalBodies = document.querySelectorAll('.modal-body');
    modalBodies.forEach(modalBody => {
        modalObserver.observe(modalBody);
    });
});

// Función helper para configurar scroll en modal cuando se abre
function configurarScrollModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    const modalBody = modal.querySelector('.modal-body');
    if (!modalBody) return;
    
    // Detectar scroll después de que se renderice
    setTimeout(() => {
        detectarScrollModal(modalId);
    }, 100);
    
    // Escuchar eventos de scroll para efectos adicionales
    modalBody.addEventListener('scroll', function() {
        const isAtTop = this.scrollTop === 0;
        const isAtBottom = this.scrollTop + this.clientHeight >= this.scrollHeight - 1;
        
        // Agregar clases para efectos visuales opcionales
        this.classList.toggle('scrolled-from-top', !isAtTop);
        this.classList.toggle('scrolled-to-bottom', isAtBottom);
    });
}

// Función para limpiar el formulario de jugador
function limpiarFormularioJugador() {
    const form = document.getElementById('form-crear-jugador');
    if (form) {
        form.reset();
    }
    
    // Restaurar estado inicial del campo nombre
    const inputNombre = document.getElementById('nombre');
    if (inputNombre) {
        inputNombre.setAttribute('readonly', 'readonly');
        inputNombre.placeholder = 'Se llenará automáticamente...';
        inputNombre.style.backgroundColor = '';
    }
    
    // Limpiar mensajes
    const mensajes = document.getElementById('mensaje-jugador');
    if (mensajes) {
        mensajes.innerHTML = '';
    }
}

// Función para cargar jugadores en los selectores de crear partida
async function cargarJugadoresEnSelectores() {
    try {
        mostrarLoading(true);
        
        const jugadores = await obtenerJugadores();
        
        // Limpiar selectores
        const selector1 = document.getElementById('jugador1');
        const selector2 = document.getElementById('jugador2');
        
        if (selector1 && selector2) {
            selector1.innerHTML = '<option value="">Seleccione un jugador</option>';
            selector2.innerHTML = '<option value="">Seleccione un jugador</option>';
            
            // Llenar con jugadores
            jugadores.forEach(jugador => {
                const option1 = document.createElement('option');
                option1.value = jugador.id;
                option1.textContent = `${jugador.identificacion} - ${jugador.nombre}`;
                selector1.appendChild(option1);
                
                const option2 = document.createElement('option');
                option2.value = jugador.id;
                option2.textContent = `${jugador.identificacion} - ${jugador.nombre}`;
                selector2.appendChild(option2);
            });
        }
        
    } catch (error) {
        console.error('Error al cargar jugadores:', error);
        mostrarMensaje('mensaje-partida', 
            'Error al cargar la lista de jugadores', 'error');
    } finally {
        mostrarLoading(false);
    }
}

// Función para manejar el formulario de crear partida
async function manejarCrearPartida(evento) {
    evento.preventDefault();
    
    const form = evento.target;
    const formData = new FormData(form);
    
    const datosPartida = {
        jugador1Id: parseInt(formData.get('jugador1')),
        jugador2Id: parseInt(formData.get('jugador2'))
    };
    
    // Validaciones
    if (!datosPartida.jugador1Id || !datosPartida.jugador2Id) {
        mostrarMensaje('mensaje-partida', 'Debe seleccionar ambos jugadores', 'error');
        return;
    }
    
    if (datosPartida.jugador1Id === datosPartida.jugador2Id) {
        mostrarMensaje('mensaje-partida', 'Los jugadores deben ser diferentes', 'error');
        return;
    }
    
    try {
        mostrarLoading(true);
        
        const partidaCreada = await crearPartida(datosPartida);
        
        mostrarMensaje('mensaje-partida', 
            '¡Partida creada exitosamente!', 'exito');
        
        // Cargar la partida y mostrar el juego
        partidaActual = partidaCreada;
        setTimeout(() => {
            iniciarJuego(partidaCreada);
        }, 1000);
        
    } catch (error) {
        mostrarMensaje('mensaje-partida', 
            `Error: ${error.message}`, 'error');
    } finally {
        mostrarLoading(false);
    }
}

// Función para limpiar el formulario de partida
function limpiarFormularioPartida() {
    const form = document.getElementById('form-crear-partida');
    if (form) {
        form.reset();
    }
    
    // Limpiar mensajes
    const mensajes = document.getElementById('mensaje-partida');
    if (mensajes) {
        mensajes.innerHTML = '';
    }
}
