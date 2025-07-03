// Modelo para Partida
export interface IPartida {
  id: number;
  jugador1Id: number;
  jugador2Id: number;
  estado: EstadoPartida;
  ganadorId: number | null;
  resultado: ResultadoPartida | null;
  tablero: Tablero;
  turnoActual: number;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

// Enums para estados y resultados
export enum EstadoPartida {
  EN_CURSO = 'en_curso',
  FINALIZADA = 'finalizada'
}

export enum ResultadoPartida {
  VICTORIA = 'victoria',
  EMPATE = 'empate'
}

// Tipo para el tablero (7 columnas x 6 filas)
export type Tablero = number[][]; // 0 = vacío, 1 = jugador1, 2 = jugador2

// Columnas válidas del juego
export enum ColumnaLetra {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  E = 'E',
  F = 'F',
  G = 'G'
}

// DTO para crear nueva partida
export interface CrearPartidaDTO {
  jugador1Id: number;
  jugador2Id: number;
}

// DTO para realizar movimiento
export interface RealizarMovimientoDTO {
  partidaId: number;
  jugadorId: number;
  columnaLetra: ColumnaLetra;
}

// Resultado de un movimiento
export interface ResultadoMovimiento {
  exito: boolean;
  mensaje: string;
  partidaFinalizada: boolean;
  ganador: number | null;
  esEmpate: boolean;
  nuevaFilaPosicion?: number;
}

// Información completa de partida para el frontend
export interface PartidaCompleta extends IPartida {
  jugador1Nombre: string;
  jugador2Nombre: string;
  ganadorNombre: string | null;
}

// Validaciones y lógica del juego
export class LogicaConnect4 {
  static readonly FILAS = 6;
  static readonly COLUMNAS = 7;
  static readonly CONECTAR = 4;

  // Crear tablero vacío
  static crearTableroVacio(): Tablero {
    return Array(this.FILAS).fill(null).map(() => Array(this.COLUMNAS).fill(0));
  }

  // Convertir letra de columna a índice
  static letraAIndice(letra: ColumnaLetra): number {
    return letra.charCodeAt(0) - 'A'.charCodeAt(0);
  }

  // Validar si se puede realizar movimiento en columna
  static puedeJugarEnColumna(tablero: Tablero, columna: number): boolean {
    if (columna < 0 || columna >= this.COLUMNAS || !tablero[0]) {
      return false;
    }
    return tablero[0][columna] === 0;
  }

  // Realizar movimiento y retornar nueva fila
  static realizarMovimiento(tablero: Tablero, columna: number, jugador: number): number {
    for (let fila = this.FILAS - 1; fila >= 0; fila--) {
      const filaTablero = tablero[fila];
      if (filaTablero && filaTablero[columna] === 0) {
        filaTablero[columna] = jugador;
        return fila;
      }
    }
    return -1; // No se pudo realizar el movimiento
  }

  // Verificar victoria
  static verificarVictoria(tablero: Tablero, fila: number, columna: number, jugador: number): boolean {
    return (
      this.verificarHorizontal(tablero, fila, columna, jugador) ||
      this.verificarVertical(tablero, fila, columna, jugador) ||
      this.verificarDiagonalPrincipal(tablero, fila, columna, jugador) ||
      this.verificarDiagonalSecundaria(tablero, fila, columna, jugador)
    );
  }

  // Verificar si hay empate (tablero lleno)
  static verificarEmpate(tablero: Tablero): boolean {
    const primeraFila = tablero[0];
    return primeraFila ? primeraFila.every(celda => celda !== 0) : false;
  }

  // Verificaciones direccionales privadas
  private static verificarHorizontal(tablero: Tablero, fila: number, columna: number, jugador: number): boolean {
    let count = 1;
    
    // Verificar hacia la izquierda
    for (let c = columna - 1; c >= 0 && tablero[fila]?.[c] === jugador; c--) {
      count++;
    }
    
    // Verificar hacia la derecha
    for (let c = columna + 1; c < this.COLUMNAS && tablero[fila]?.[c] === jugador; c++) {
      count++;
    }
    
    return count >= this.CONECTAR;
  }

  private static verificarVertical(tablero: Tablero, fila: number, columna: number, jugador: number): boolean {
    let count = 1;
    
    // Solo verificar hacia abajo (las fichas caen hacia abajo)
    for (let f = fila + 1; f < this.FILAS && tablero[f]?.[columna] === jugador; f++) {
      count++;
    }
    
    return count >= this.CONECTAR;
  }

  private static verificarDiagonalPrincipal(tablero: Tablero, fila: number, columna: number, jugador: number): boolean {
    let count = 1;
    
    // Verificar diagonal ascendente hacia la izquierda
    for (let f = fila - 1, c = columna - 1; f >= 0 && c >= 0 && tablero[f]?.[c] === jugador; f--, c--) {
      count++;
    }
    
    // Verificar diagonal descendente hacia la derecha
    for (let f = fila + 1, c = columna + 1; f < this.FILAS && c < this.COLUMNAS && tablero[f]?.[c] === jugador; f++, c++) {
      count++;
    }
    
    return count >= this.CONECTAR;
  }

  private static verificarDiagonalSecundaria(tablero: Tablero, fila: number, columna: number, jugador: number): boolean {
    let count = 1;
    
    // Verificar diagonal ascendente hacia la derecha
    for (let f = fila - 1, c = columna + 1; f >= 0 && c < this.COLUMNAS && tablero[f]?.[c] === jugador; f--, c++) {
      count++;
    }
    
    // Verificar diagonal descendente hacia la izquierda
    for (let f = fila + 1, c = columna - 1; f < this.FILAS && c >= 0 && tablero[f]?.[c] === jugador; f++, c--) {
      count++;
    }
    
    return count >= this.CONECTAR;
  }
}

// Validador de partida
export class ValidadorPartida {
  static validarCreacion(datos: CrearPartidaDTO): string[] {
    const errores: string[] = [];

    if (datos.jugador1Id === datos.jugador2Id) {
      errores.push('Un jugador no puede jugar contra sí mismo');
    }

    if (datos.jugador1Id <= 0 || datos.jugador2Id <= 0) {
      errores.push('IDs de jugadores deben ser números positivos');
    }

    return errores;
  }

  static validarMovimiento(datos: RealizarMovimientoDTO): string[] {
    const errores: string[] = [];

    if (!Object.values(ColumnaLetra).includes(datos.columnaLetra)) {
      errores.push('Columna debe ser una letra válida (A-G)');
    }

    if (datos.jugadorId <= 0) {
      errores.push('ID del jugador debe ser un número positivo');
    }

    if (datos.partidaId <= 0) {
      errores.push('ID de la partida debe ser un número positivo');
    }

    return errores;
  }
} 