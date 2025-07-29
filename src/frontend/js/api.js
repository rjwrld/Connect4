// ===== API CLIENT =====

const API_BASE_URL = '/api';
const DEFAULT_TIMEOUT = 10000; // 10 segundos
const MAX_RETRIES = 2;

// Configuración base para las peticiones
const apiConfig = {
    headers: {
        'Content-Type': 'application/json',
    }
};

// Función helper para realizar peticiones con timeout y retry
async function fetchWithTimeout(url, options = {}, timeout = DEFAULT_TIMEOUT, retries = MAX_RETRIES) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const fetchOptions = {
        ...options,
        signal: controller.signal
    };
    
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            console.log(`🌐 Realizando petición a: ${url} (intento ${attempt + 1}/${retries + 1})`);
            
            const response = await fetch(url, fetchOptions);
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.mensaje || `HTTP ${response.status}: ${response.statusText}`);
            }
            
            return response;
            
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (attempt === retries) {
                // Es el último intento, lanzar el error
                if (error.name === 'AbortError') {
                    throw new Error('⏱️ Tiempo de espera agotado. Verifica tu conexión a internet.');
                } else if (error.message.includes('fetch')) {
                    throw new Error('🌐 Error de conexión. Verifica que el servidor esté funcionando.');
                } else {
                    throw error;
                }
            }
            
            // Esperar un poco antes del siguiente intento
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
    }
}

// ===== FUNCIONES DE JUGADORES =====

async function obtenerJugadores() {
    try {
        const response = await fetchWithTimeout(`${API_BASE_URL}/jugadores`);
        const resultado = await response.json();
        
        if (resultado.exito) {
            console.log(`✅ ${resultado.datos.length} jugadores obtenidos exitosamente`);
            return resultado.datos;
        } else {
            throw new Error(resultado.mensaje || 'Error al obtener jugadores');
        }
    } catch (error) {
        console.error('❌ Error al obtener jugadores:', error);
        throw new Error(`Error al cargar jugadores: ${error.message}`);
    }
}

async function crearJugador(datosJugador) {
    try {
        console.log('👤 Creando jugador:', datosJugador);
        
        const response = await fetchWithTimeout(`${API_BASE_URL}/jugadores`, {
            method: 'POST',
            ...apiConfig,
            body: JSON.stringify(datosJugador)
        });
        
        const resultado = await response.json();
        
        if (resultado.exito) {
            console.log('✅ Jugador creado exitosamente:', resultado.datos);
            return resultado.datos;
        } else {
            throw new Error(resultado.mensaje || 'Error al crear jugador');
        }
    } catch (error) {
        console.error('❌ Error al crear jugador:', error);
        
        // Mejorar mensajes de error específicos
        if (error.message.includes('identificación')) {
            throw new Error('Ya existe un jugador con esta identificación');
        } else if (error.message.includes('400')) {
            throw new Error('Datos del jugador inválidos. Verifica la información ingresada.');
        } else {
            throw new Error(`Error al crear jugador: ${error.message}`);
        }
    }
}

async function obtenerJugadorPorId(id) {
    try {
        const response = await fetchWithTimeout(`${API_BASE_URL}/jugadores/${id}`);
        const resultado = await response.json();
        
        if (resultado.exito) {
            return resultado.datos;
        } else {
            throw new Error(resultado.mensaje || 'Error al obtener jugador');
        }
    } catch (error) {
        console.error('❌ Error al obtener jugador:', error);
        throw new Error(`Error al cargar información del jugador: ${error.message}`);
    }
}

// ===== FUNCIONES DE PARTIDAS =====

async function obtenerPartidas() {
    try {
        const response = await fetchWithTimeout(`${API_BASE_URL}/partidas`);
        const resultado = await response.json();
        
        if (resultado.exito) {
            console.log(`✅ ${resultado.datos.length} partidas obtenidas exitosamente`);
            return resultado.datos;
        } else {
            throw new Error(resultado.mensaje || 'Error al obtener partidas');
        }
    } catch (error) {
        console.error('❌ Error al obtener partidas:', error);
        throw new Error(`Error al cargar partidas: ${error.message}`);
    }
}

async function crearPartida(datosPartida) {
    try {
        console.log('🎮 Creando partida:', datosPartida);
        
        const response = await fetchWithTimeout(`${API_BASE_URL}/partidas`, {
            method: 'POST',
            ...apiConfig,
            body: JSON.stringify(datosPartida)
        }, 15000); // Timeout más largo para crear partida
        
        const resultado = await response.json();
        
        if (resultado.exito) {
            console.log('✅ Partida creada exitosamente:', resultado.datos);
            return resultado.datos;
        } else {
            throw new Error(resultado.mensaje || 'Error al crear partida');
        }
    } catch (error) {
        console.error('❌ Error al crear partida:', error);
        
        if (error.message.includes('mismo jugador')) {
            throw new Error('Un jugador no puede jugar contra sí mismo');
        } else if (error.message.includes('no existen')) {
            throw new Error('Uno o ambos jugadores seleccionados no existen');
        } else {
            throw new Error(`Error al crear partida: ${error.message}`);
        }
    }
}

async function obtenerPartidaPorId(id) {
    try {
        const response = await fetchWithTimeout(`${API_BASE_URL}/partidas/${id}`);
        const resultado = await response.json();
        
        if (resultado.exito) {
            return resultado.datos;
        } else {
            throw new Error(resultado.mensaje || 'Error al obtener partida');
        }
    } catch (error) {
        console.error('❌ Error al obtener partida:', error);
        throw new Error(`Error al cargar partida: ${error.message}`);
    }
}

async function realizarMovimiento(partidaId, datosMovimiento) {
    try {
        console.log('🎯 Realizando movimiento:', datosMovimiento);
        
        const response = await fetchWithTimeout(`${API_BASE_URL}/partidas/${partidaId}/movimiento`, {
            method: 'POST',
            ...apiConfig,
            body: JSON.stringify(datosMovimiento)
        }, 8000); // Timeout más corto para movimientos
        
        const resultado = await response.json();
        
        if (resultado.exito) {
            console.log('✅ Movimiento realizado:', resultado.mensaje);
            return resultado;
        } else {
            throw new Error(resultado.mensaje || 'Error al realizar movimiento');
        }
    } catch (error) {
        console.error('❌ Error al realizar movimiento:', error);
        
        if (error.message.includes('turno')) {
            throw new Error('No es tu turno. Espera a que juegue el otro jugador.');
        } else if (error.message.includes('columna')) {
            throw new Error('No se puede jugar en esta columna. Está llena.');
        } else if (error.message.includes('finalizada')) {
            throw new Error('Esta partida ya ha finalizado.');
        } else {
            throw new Error(`Error en el movimiento: ${error.message}`);
        }
    }
}

// ===== FUNCIONES DE ESCALAFÓN =====

async function obtenerEscalafon() {
    try {
        const response = await fetchWithTimeout(`${API_BASE_URL}/escalafon`);
        const resultado = await response.json();
        
        if (resultado.exito) {
            console.log(`✅ Escalafón obtenido: ${resultado.datos.length} jugadores`);
            return resultado.datos;
        } else {
            throw new Error(resultado.mensaje || 'Error al obtener escalafón');
        }
    } catch (error) {
        console.error('❌ Error al obtener escalafón:', error);
        throw new Error(`Error al cargar escalafón: ${error.message}`);
    }
}

// ===== FUNCIONES DE UTILIDAD =====

// Función para verificar conexión con el servidor
async function verificarConexionServidor() {
    try {
        const response = await fetchWithTimeout(`${API_BASE_URL}/escalafon`, {}, 5000, 0); // Sin retries
        return true;
    } catch (error) {
        console.warn('⚠️ Servidor no disponible:', error.message);
        return false;
    }
}

// Función para mostrar estado de conexión en la interfaz
function mostrarEstadoConexion(conectado) {
    const header = document.querySelector('.header');
    if (!header) return;
    
    let indicador = header.querySelector('.indicador-conexion');
    if (!indicador) {
        indicador = document.createElement('div');
        indicador.className = 'indicador-conexion';
        header.appendChild(indicador);
    }
    
    if (conectado) {
        indicador.innerHTML = '🟢 Conectado';
        indicador.style.color = '#27ae60';
    } else {
        indicador.innerHTML = '🔴 Sin conexión';
        indicador.style.color = '#e74c3c';
    }
}
