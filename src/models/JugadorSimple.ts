// Modelo para Jugador - ajustado a la estructura real de la BD
export interface IJugador {
  idJugador: number;
  nombre: string;
  marcador: number;
}

// DTO para crear un nuevo jugador
export interface CrearJugadorDTO {
  nombre: string;
}

// DTO para actualizar estadísticas de jugador
export interface ActualizarEstadisticasJugadorDTO {
  marcador?: number;
}

// Validaciones
export class ValidadorJugador {
  static validarNombre(nombre: string): boolean {
    return nombre.trim().length > 0 && nombre.trim().length <= 100;
  }

  static validarDatosCreacion(datos: CrearJugadorDTO): string[] {
    const errores: string[] = [];

    if (!this.validarNombre(datos.nombre)) {
      errores.push('Nombre debe tener entre 1 y 100 caracteres');
    }

    return errores;
  }

  static calcularMarcador(partidasGanadas: number, partidasPerdidas: number): number {
    // Lógica simple: +3 por victoria, -1 por derrota
    return (partidasGanadas * 3) - partidasPerdidas;
  }
}
