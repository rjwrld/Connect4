// Tipos compartidos para el proyecto Connect4

export interface JugadorInput {
  identificacion: bigint | string;
  nombre: string;
}

export interface JugadorResponse {
  id: number;
  identificacion: string;
  nombre: string;
  partidasGanadas: number;
  partidasPerdidas: number;
  partidasEmpatadas: number;
  marcador: number;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export interface PartidaInput {
  jugador1Id: number;
  jugador2Id: number;
}

export interface PartidaResponse {
  id: number;
  jugador1Id: number;
  jugador2Id: number;
  estado: string;
  ganadorId?: number;
  resultado?: string;
  tablero: string;
  turnoActual: number;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export interface MovimientoInput {
  columnaLetra: string;
}

export interface MovimientoResponse {
  id: number;
  partidaId: number;
  jugadorId: number;
  columnaLetra: string;
  filaPosicion: number;
  numeroMovimiento: number;
  fechaCreacion: Date;
}

export interface EscalafonResponse {
  posicion: number;
  jugador: JugadorResponse;
}

export interface ApiError {
  error: string;
  message: string;
  details?: any;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

// Tipos para el tablero del juego
export type Tablero = number[][];
export type EstadoPartida = 'en_curso' | 'finalizada' | 'pausada';
export type Resultado = 'Jugador 1' | 'Jugador 2' | 'Empate';

// Constantes del juego
export const GAME_CONSTANTS = {
  BOARD_ROWS: 6,
  BOARD_COLS: 7,
  COLUMNS: ['A', 'B', 'C', 'D', 'E', 'F', 'G'] as const,
  WIN_CONDITION: 4,
  EMPTY_CELL: 0,
  PLAYER_1: 1,
  PLAYER_2: 2
} as const;

export type ColumnaLetra = typeof GAME_CONSTANTS.COLUMNS[number]; 