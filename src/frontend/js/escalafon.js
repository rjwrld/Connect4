// ===== ESCALAFÓN =====

async function cargarEscalafon() {
    try {
        mostrarLoading(true);
        
        const escalafon = await obtenerEscalafon();
        
        const tbody = document.getElementById('cuerpo-escalafon');
        if (!tbody) return;
        
        // Limpiar tabla
        tbody.innerHTML = '';
        
        if (escalafon.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 20px;">
                        No hay jugadores registrados
                    </td>
                </tr>
            `;
            return;
        }
        
        // Llenar tabla con datos
        escalafon.forEach((jugador, index) => {
            const fila = document.createElement('tr');
            
            // Agregar clase para resaltar los primeros 3 lugares
            if (index < 3) {
                fila.classList.add(`posicion-${index + 1}`);
            }
            
            fila.innerHTML = `
                <td class="posicion">${index + 1}</td>
                <td>${jugador.identificacion}</td>
                <td class="nombre">${jugador.nombre}</td>
                <td class="marcador">${jugador.marcador}</td>
                <td class="ganadas">${jugador.partidasGanadas}</td>
                <td class="perdidas">${jugador.partidasPerdidas}</td>
                <td class="empatadas">${jugador.partidasEmpatadas}</td>
            `;
            
            tbody.appendChild(fila);
        });
        
    } catch (error) {
        console.error('Error al cargar escalafón:', error);
        
        const tbody = document.getElementById('cuerpo-escalafon');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 20px; color: red;">
                        Error al cargar el escalafón: ${error.message}
                    </td>
                </tr>
            `;
        }
    } finally {
        mostrarLoading(false);
    }
}
