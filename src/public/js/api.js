// ===== API CLIENT =====

const API_BASE_URL = 'http://localhost:3000/api';

// Configuración base para las peticiones
const apiConfig = {
    headers: {
        'Content-Type': 'application/json',
    }
};

// ===== FUNCIONES DE JUGADORES =====

async function obtenerJugadores() {
    try {
        const response = await fetch(`${API_BASE_URL}/jugadores`);
        const resultado = await response.json();
        
        if (resultado.exito) {
            return resultado.datos;
        } else {
            throw new Error(resultado.mensaje || 'Error al obtener jugadores');
        }
    } catch (error) {
        console.error('Error al obtener jugadores:', error);
        throw error;
    }
}

async function crearJugador(datosJugador) {
    try {
        const response = await fetch(`${API_BASE_URL}/jugadores`, {
            method: 'POST',
            ...apiConfig,
            body: JSON.stringify(datosJugador)
        });
        
        const resultado = await response.json();
        
        if (resultado.exito) {
            return resultado.datos;
        } else {
            throw new Error(resultado.mensaje || 'Error al crear jugador');
        }
    } catch (error) {
        console.error('Error al crear jugador:', error);
        throw error;
    }
}

async function obtenerJugadorPorId(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/jugadores/${id}`);
        const resultado = await response.json();
        
        if (resultado.exito) {
            return resultado.datos;
        } else {
            throw new Error(resultado.mensaje || 'Error al obtener jugador');
        }
    } catch (error) {
        console.error('Error al obtener jugador:', error);
        throw error;
    }
}

// ===== FUNCIONES DE PARTIDAS =====

async function obtenerPartidas() {
    try {
        const response = await fetch(`${API_BASE_URL}/partidas`);
        const resultado = await response.json();
        
        if (resultado.exito) {
            return resultado.datos;
        } else {
            throw new Error(resultado.mensaje || 'Error al obtener partidas');
        }
    } catch (error) {
        console.error('Error al obtener partidas:', error);
        throw error;
    }
}

async function crearPartida(datosPartida) {
    try {
        const response = await fetch(`${API_BASE_URL}/partidas`, {
            method: 'POST',
            ...apiConfig,
            body: JSON.stringify(datosPartida)
        });
        
        const resultado = await response.json();
        
        if (resultado.exito) {
            return resultado.datos;
        } else {
            throw new Error(resultado.mensaje || 'Error al crear partida');
        }
    } catch (error) {
        console.error('Error al crear partida:', error);
        throw error;
    }
}

async function obtenerPartidaPorId(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/partidas/${id}`);
        const resultado = await response.json();
        
        if (resultado.exito) {
            return resultado.datos;
        } else {
            throw new Error(resultado.mensaje || 'Error al obtener partida');
        }
    } catch (error) {
        console.error('Error al obtener partida:', error);
        throw error;
    }
}

async function realizarMovimiento(partidaId, datosMovimiento) {
    try {
        const response = await fetch(`${API_BASE_URL}/partidas/${partidaId}/movimiento`, {
            method: 'POST',
            ...apiConfig,
            body: JSON.stringify(datosMovimiento)
        });
        
        const resultado = await response.json();
        
        if (resultado.exito) {
            return resultado.datos;
        } else {
            throw new Error(resultado.mensaje || 'Error al realizar movimiento');
        }
    } catch (error) {
        console.error('Error al realizar movimiento:', error);
        throw error;
    }
}

// ===== FUNCIONES DE ESCALAFÓN =====

async function obtenerEscalafon() {
    try {
        const response = await fetch(`${API_BASE_URL}/escalafon`);
        const resultado = await response.json();
        
        if (resultado.exito) {
            return resultado.datos;
        } else {
            throw new Error(resultado.mensaje || 'Error al obtener escalafón');
        }
    } catch (error) {
        console.error('Error al obtener escalafón:', error);
        throw error;
    }
}
