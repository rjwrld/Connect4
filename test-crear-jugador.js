// Prueba de crear jugador
const testCrearJugador = async () => {
    try {
        const response = await fetch('http://localhost:3000/api/jugadores', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                identificacion: '123456789',
                nombre: 'Juan Pérez'
            })
        });
        
        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', data);
        
        if (!response.ok) {
            console.error('Error:', data);
        }
        
    } catch (error) {
        console.error('Error de red:', error);
    }
};

// Esperar un poco para que el servidor arranque
setTimeout(testCrearJugador, 3000);
