import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { JugadorEscalafon } from '../models/Jugador';

const prisma = new PrismaClient();

export class EscalafonControlador {
  // GET /api/escalafon - Obtener escalafón de jugadores ordenado por marcador
  async obtenerEscalafon(req: Request, res: Response): Promise<void> {
    try {
      const jugadores = await prisma.jugador.findMany({
        orderBy: [
          { marcador: 'desc' },
          { partidasGanadas: 'desc' },
          { fechaCreacion: 'asc' }
        ],
        select: {
          id: true,
          identificacion: true,
          nombre: true,
          marcador: true,
          partidasGanadas: true,
          partidasPerdidas: true,
          partidasEmpatadas: true
        }
      });

      // Formatear datos para el escalafón
      const escalafon: JugadorEscalafon[] = jugadores.map(jugador => ({
        identificacion: jugador.identificacion,
        nombre: jugador.nombre,
        marcador: jugador.marcador,
        partidasGanadas: jugador.partidasGanadas,
        partidasPerdidas: jugador.partidasPerdidas,
        partidasEmpatadas: jugador.partidasEmpatadas
      }));

      res.json({
        exito: true,
        datos: escalafon,
        total: escalafon.length
      });
    } catch (error) {
      console.error('Error al obtener escalafón:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error interno del servidor'
      });
    }
  }
} 