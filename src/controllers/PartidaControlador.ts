import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { 
  CrearPartidaDTO, 
  RealizarMovimientoDTO,
  LogicaConnect4,
  ColumnaLetra,
  EstadoPartida,
  ResultadoPartida,
  ValidadorPartida
} from '../models/Partida';

const prisma = new PrismaClient();

export class PartidaControlador {
  // GET /api/partidas - Obtener todas las partidas
  async obtenerTodas(req: Request, res: Response): Promise<void> {
    try {
      const partidas = await prisma.partida.findMany({
        include: {
          jugador1: true,
          jugador2: true,
          ganador: true
        },
        orderBy: { fechaCreacion: 'desc' }
      });
      
      res.json({
        exito: true,
        datos: partidas
      });
    } catch (error) {
      console.error('Error al obtener partidas:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error interno del servidor'
      });
    }
  }

  // GET /api/partidas/:id - Obtener partida por ID
  async obtenerPorId(req: Request, res: Response): Promise<void> {
    try {
      const idParam = req.params.id;
      if (!idParam) {
        res.status(400).json({
          exito: false,
          mensaje: 'ID requerido'
        });
        return;
      }
      
      const id = parseInt(idParam);
      if (isNaN(id)) {
        res.status(400).json({
          exito: false,
          mensaje: 'ID inválido'
        });
        return;
      }

      const partida = await prisma.partida.findUnique({
        where: { id },
        include: {
          jugador1: true,
          jugador2: true,
          ganador: true
        }
      });

      if (!partida) {
        res.status(404).json({
          exito: false,
          mensaje: 'Partida no encontrada'
        });
        return;
      }

      res.json({
        exito: true,
        datos: partida
      });
    } catch (error) {
      console.error('Error al obtener partida:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error interno del servidor'
      });
    }
  }

  // POST /api/partidas - Crear nueva partida
  async crear(req: Request, res: Response): Promise<void> {
    try {
      const { jugador1Id, jugador2Id }: CrearPartidaDTO = req.body;
      
      // Validar datos
      const errores = ValidadorPartida.validarCreacion({ jugador1Id, jugador2Id });
      if (errores.length > 0) {
        res.status(400).json({
          exito: false,
          mensaje: 'Datos inválidos',
          errores
        });
        return;
      }

      // Verificar que ambos jugadores existen
      const jugadores = await prisma.jugador.findMany({
        where: { id: { in: [jugador1Id, jugador2Id] } }
      });

      if (jugadores.length !== 2) {
        res.status(400).json({
          exito: false,
          mensaje: 'Uno o ambos jugadores no existen'
        });
        return;
      }

      // Crear tablero vacío
      const tableroVacio = LogicaConnect4.crearTableroVacio();

      // Crear nueva partida
      const nuevaPartida = await prisma.partida.create({
        data: {
          jugador1Id,
          jugador2Id,
          tablero: tableroVacio,
          turnoActual: 1,
          estado: EstadoPartida.EN_CURSO
        },
        include: {
          jugador1: true,
          jugador2: true
        }
      });

      res.status(201).json({
        exito: true,
        mensaje: 'Partida creada exitosamente',
        datos: nuevaPartida
      });
    } catch (error) {
      console.error('Error al crear partida:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error interno del servidor'
      });
    }
  }

  // POST /api/partidas/:id/movimiento - Realizar movimiento en partida
  async realizarMovimiento(req: Request, res: Response): Promise<void> {
    try {
      const idParam = req.params.id;
      if (!idParam) {
        res.status(400).json({
          exito: false,
          mensaje: 'ID requerido'
        });
        return;
      }
      
      const partidaId = parseInt(idParam);
      if (isNaN(partidaId)) {
        res.status(400).json({
          exito: false,
          mensaje: 'ID inválido'
        });
        return;
      }

      const { jugadorId, columnaLetra }: { jugadorId: number; columnaLetra: ColumnaLetra } = req.body;

      // Validar movimiento
      const errores = ValidadorPartida.validarMovimiento({ partidaId, jugadorId, columnaLetra });
      if (errores.length > 0) {
        res.status(400).json({
          exito: false,
          mensaje: 'Movimiento inválido',
          errores
        });
        return;
      }

      // Obtener partida
      const partida = await prisma.partida.findUnique({
        where: { id: partidaId },
        include: { jugador1: true, jugador2: true }
      });

      if (!partida) {
        res.status(404).json({
          exito: false,
          mensaje: 'Partida no encontrada'
        });
        return;
      }

      // Verificar que la partida está en curso
      if (partida.estado !== EstadoPartida.EN_CURSO) {
        res.status(400).json({
          exito: false,
          mensaje: 'La partida ya ha finalizado'
        });
        return;
      }

      // Verificar que es el turno del jugador correcto
      const jugadorEsperado = partida.turnoActual === 1 ? partida.jugador1Id : partida.jugador2Id;
      if (jugadorId !== jugadorEsperado) {
        res.status(400).json({
          exito: false,
          mensaje: 'No es el turno de este jugador'
        });
        return;
      }

      // Obtener tablero actual
      const tablero = partida.tablero as number[][];
      const columnaIndice = LogicaConnect4.letraAIndice(columnaLetra);

      // Verificar que se puede jugar en la columna
      if (!LogicaConnect4.puedeJugarEnColumna(tablero, columnaIndice)) {
        res.status(400).json({
          exito: false,
          mensaje: 'No se puede jugar en esta columna'
        });
        return;
      }

      // Realizar movimiento
      const filaResultado = LogicaConnect4.realizarMovimiento(tablero, columnaIndice, partida.turnoActual);

      // Verificar si hay victoria
      const hayVictoria = LogicaConnect4.verificarVictoria(tablero, filaResultado, columnaIndice, partida.turnoActual);
      
      // Verificar si hay empate
      const hayEmpate = LogicaConnect4.verificarEmpate(tablero);

      let datosActualizacion: any = {
        tablero,
        turnoActual: partida.turnoActual === 1 ? 2 : 1 // Cambiar turno
      };

      if (hayVictoria) {
        datosActualizacion.estado = EstadoPartida.FINALIZADA;
        datosActualizacion.resultado = ResultadoPartida.VICTORIA;
        datosActualizacion.ganadorId = jugadorId;
        
        // Actualizar estadísticas de los jugadores
        await this.actualizarEstadisticasJugadores(partida.jugador1Id, partida.jugador2Id, jugadorId);
      } else if (hayEmpate) {
        datosActualizacion.estado = EstadoPartida.FINALIZADA;
        datosActualizacion.resultado = ResultadoPartida.EMPATE;
        
        // Actualizar estadísticas de empate
        await this.actualizarEstadisticasEmpate(partida.jugador1Id, partida.jugador2Id);
      }

      // Actualizar partida
      const partidaActualizada = await prisma.partida.update({
        where: { id: partidaId },
        data: datosActualizacion,
        include: {
          jugador1: true,
          jugador2: true,
          ganador: true
        }
      });

      // Registrar movimiento
      await prisma.movimiento.create({
        data: {
          partidaId,
          jugadorId,
          columnaLetra,
          filaPosicion: filaResultado,
          numeroMovimiento: await this.obtenerNumeroMovimiento(partidaId)
        }
      });

      res.json({
        exito: true,
        mensaje: hayVictoria ? 'Victoria!' : hayEmpate ? 'Empate!' : 'Movimiento realizado',
        datos: partidaActualizada,
        partidaFinalizada: hayVictoria || hayEmpate,
        ganador: hayVictoria ? jugadorId : null,
        esEmpate: hayEmpate
      });
    } catch (error) {
      console.error('Error al realizar movimiento:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error interno del servidor'
      });
    }
  }

  // POST /api/partidas/:id/reiniciar - Reiniciar partida con los mismos jugadores
  async reiniciar(req: Request, res: Response): Promise<void> {
    try {
      const idParam = req.params.id;
      if (!idParam) {
        res.status(400).json({
          exito: false,
          mensaje: 'ID requerido'
        });
        return;
      }
      
      const partidaId = parseInt(idParam);
      if (isNaN(partidaId)) {
        res.status(400).json({
          exito: false,
          mensaje: 'ID inválido'
        });
        return;
      }

      // Obtener partida original
      const partidaOriginal = await prisma.partida.findUnique({
        where: { id: partidaId },
        include: { jugador1: true, jugador2: true }
      });

      if (!partidaOriginal) {
        res.status(404).json({
          exito: false,
          mensaje: 'Partida no encontrada'
        });
        return;
      }

      // Crear nueva partida con los mismos jugadores
      const tableroVacio = LogicaConnect4.crearTableroVacio();
      const nuevaPartida = await prisma.partida.create({
        data: {
          jugador1Id: partidaOriginal.jugador1Id,
          jugador2Id: partidaOriginal.jugador2Id,
          tablero: tableroVacio,
          turnoActual: 1,
          estado: EstadoPartida.EN_CURSO
        },
        include: {
          jugador1: true,
          jugador2: true
        }
      });

      res.status(201).json({
        exito: true,
        mensaje: 'Partida reiniciada exitosamente',
        datos: nuevaPartida
      });
    } catch (error) {
      console.error('Error al reiniciar partida:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error interno del servidor'
      });
    }
  }

  // PUT /api/partidas/:id - Actualizar estado de partida
  async actualizar(req: Request, res: Response): Promise<void> {
    try {
      const idParam = req.params.id;
      if (!idParam) {
        res.status(400).json({
          exito: false,
          mensaje: 'ID requerido'
        });
        return;
      }
      
      const id = parseInt(idParam);
      if (isNaN(id)) {
        res.status(400).json({
          exito: false,
          mensaje: 'ID inválido'
        });
        return;
      }

      const { estado, resultado, ganadorId } = req.body;

      const partidaActualizada = await prisma.partida.update({
        where: { id },
        data: {
          estado,
          resultado,
          ganadorId
        },
        include: {
          jugador1: true,
          jugador2: true,
          ganador: true
        }
      });

      res.json({
        exito: true,
        mensaje: 'Partida actualizada exitosamente',
        datos: partidaActualizada
      });
    } catch (error) {
      console.error('Error al actualizar partida:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error interno del servidor'
      });
    }
  }

  // Métodos auxiliares privados
  private async actualizarEstadisticasJugadores(jugador1Id: number, jugador2Id: number, ganadorId: number): Promise<void> {
    const perdedorId = ganadorId === jugador1Id ? jugador2Id : jugador1Id;

    // Actualizar estadísticas del ganador
    await prisma.jugador.update({
      where: { id: ganadorId },
      data: {
        partidasGanadas: { increment: 1 },
        marcador: { increment: 1 }
      }
    });

    // Actualizar estadísticas del perdedor
    await prisma.jugador.update({
      where: { id: perdedorId },
      data: {
        partidasPerdidas: { increment: 1 },
        marcador: { decrement: 1 }
      }
    });
  }

  private async actualizarEstadisticasEmpate(jugador1Id: number, jugador2Id: number): Promise<void> {
    // Actualizar estadísticas de empate para ambos jugadores
    await prisma.jugador.update({
      where: { id: jugador1Id },
      data: { partidasEmpatadas: { increment: 1 } }
    });

    await prisma.jugador.update({
      where: { id: jugador2Id },
      data: { partidasEmpatadas: { increment: 1 } }
    });
  }

  private async obtenerNumeroMovimiento(partidaId: number): Promise<number> {
    const movimientos = await prisma.movimiento.count({
      where: { partidaId }
    });
    return movimientos + 1;
  }
} 