// Modelo para Jugador
export interface IJugador {
  id: number;
  identificacion: bigint;
  nombre: string;
  partidasGanadas: number;
  partidasPerdidas: number;
  partidasEmpatadas: number;
  marcador: number;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

// DTO para crear un nuevo jugador
export interface CrearJugadorDTO {
  identificacion: bigint;
  nombre: string;
}

// DTO para actualizar estadísticas de jugador
export interface ActualizarEstadisticasJugadorDTO {
  partidasGanadas?: number;
  partidasPerdidas?: number;
  partidasEmpatadas?: number;
  marcador?: number;
}

// Tipo para el resultado del escalafón
export interface JugadorEscalafon {
  identificacion: bigint;
  nombre: string;
  marcador: number;
  partidasGanadas: number;
  partidasPerdidas: number;
  partidasEmpatadas: number;
}

// Validaciones
export class ValidadorJugador {
  static validarIdentificacion(identificacion: bigint): boolean {
    return identificacion > 0;
  }

  static validarNombre(nombre: string): boolean {
    return nombre.trim().length > 0 && nombre.trim().length <= 255;
  }

  static validarDatosCreacion(datos: CrearJugadorDTO): string[] {
    const errores: string[] = [];

    if (!this.validarIdentificacion(datos.identificacion)) {
      errores.push('La identificación debe ser un número entero positivo');
    }

    if (!this.validarNombre(datos.nombre)) {
      errores.push('El nombre es requerido y debe tener máximo 255 caracteres');
    }

    return errores;
  }

  static calcularMarcador(ganadas: number, perdidas: number): number {
    return ganadas - perdidas;
  }
} 