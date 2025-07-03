import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { CrearJugadorDTO, ValidadorJugador } from '../models/Jugador';

const prisma = new PrismaClient();

export class JugadorControlador {
  // GET /api/jugadores - Obtener todos los jugadores
  async obtenerTodos(req: Request, res: Response): Promise<void> {
    try {
      const jugadores = await prisma.jugador.findMany({
        orderBy: { fechaCreacion: 'desc' }
      });
      
      res.json({
        exito: true,
        datos: jugadores
      });
    } catch (error) {
      console.error('Error al obtener jugadores:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error interno del servidor'
      });
    }
  }

  // GET /api/jugadores/:id - Obtener jugador por ID
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

      const jugador = await prisma.jugador.findUnique({
        where: { id }
      });

      if (!jugador) {
        res.status(404).json({
          exito: false,
          mensaje: 'Jugador no encontrado'
        });
        return;
      }

      res.json({
        exito: true,
        datos: jugador
      });
    } catch (error) {
      console.error('Error al obtener jugador:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error interno del servidor'
      });
    }
  }

  // POST /api/jugadores - Crear nuevo jugador
  async crear(req: Request, res: Response): Promise<void> {
    try {
      const { identificacion, nombre }: CrearJugadorDTO = req.body;
      
      // Validar datos
      const errores = ValidadorJugador.validarDatosCreacion({
        identificacion: BigInt(identificacion),
        nombre
      });

      if (errores.length > 0) {
        res.status(400).json({
          exito: false,
          mensaje: 'Datos inválidos',
          errores
        });
        return;
      }

      // Verificar si ya existe un jugador con la misma identificación
      const jugadorExistente = await prisma.jugador.findUnique({
        where: { identificacion: BigInt(identificacion) }
      });

      if (jugadorExistente) {
        res.status(400).json({
          exito: false,
          mensaje: 'Ya existe un jugador con esta identificación'
        });
        return;
      }

      // Crear nuevo jugador
      const nuevoJugador = await prisma.jugador.create({
        data: {
          identificacion: BigInt(identificacion),
          nombre: nombre.trim()
        }
      });

      res.status(201).json({
        exito: true,
        mensaje: 'Jugador creado exitosamente',
        datos: nuevoJugador
      });
    } catch (error) {
      console.error('Error al crear jugador:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error interno del servidor'
      });
    }
  }

  // PUT /api/jugadores/:id - Actualizar estadísticas de jugador
  async actualizarEstadisticas(req: Request, res: Response): Promise<void> {
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
      const { partidasGanadas, partidasPerdidas, partidasEmpatadas } = req.body;
      
      if (isNaN(id)) {
        res.status(400).json({
          exito: false,
          mensaje: 'ID inválido'
        });
        return;
      }

      // Calcular el nuevo marcador
      const marcador = ValidadorJugador.calcularMarcador(
        partidasGanadas || 0,
        partidasPerdidas || 0
      );

      const jugadorActualizado = await prisma.jugador.update({
        where: { id },
        data: {
          partidasGanadas,
          partidasPerdidas,
          partidasEmpatadas,
          marcador
        }
      });

      res.json({
        exito: true,
        mensaje: 'Estadísticas actualizadas exitosamente',
        datos: jugadorActualizado
      });
    } catch (error) {
      console.error('Error al actualizar jugador:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error interno del servidor'
      });
    }
  }
} 