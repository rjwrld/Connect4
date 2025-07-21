// ===== GESTIÓN DE JUGADORES =====

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
    
    try {
        mostrarLoading(true);
        
        const jugadorCreado = await crearJugador(datosJugador);
        
        mostrarMensaje('mensaje-jugador', 
            `¡Jugador "${jugadorCreado.nombre}" creado exitosamente! (ID: ${jugadorCreado.identificacion})`, 'exito');
        
        // Limpiar formulario
        form.reset();
        limpiarFormularioJugador();
        
        // Opcional: regresar al menú principal después de 3 segundos
        setTimeout(() => {
            mostrarMenuPrincipal();
        }, 3000);
        
    } catch (error) {
        mostrarMensaje('mensaje-jugador', 
            `Error: ${error.message}`, 'error');
    } finally {
        mostrarLoading(false);
    }
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
