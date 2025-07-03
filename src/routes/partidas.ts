import { Router } from 'express';
import { PartidaControlador } from '../controllers/PartidaControlador';

const router = Router();
const partidaControlador = new PartidaControlador();

// GET /api/partidas - Obtener todas las partidas
router.get('/', partidaControlador.obtenerTodas);

// GET /api/partidas/:id - Obtener partida por ID
router.get('/:id', partidaControlador.obtenerPorId);

// POST /api/partidas - Crear nueva partida
router.post('/', partidaControlador.crear);

// POST /api/partidas/:id/movimiento - Realizar movimiento en partida
router.post('/:id/movimiento', partidaControlador.realizarMovimiento);

// POST /api/partidas/:id/reiniciar - Reiniciar partida con los mismos jugadores
router.post('/:id/reiniciar', partidaControlador.reiniciar);

// PUT /api/partidas/:id - Actualizar estado de partida
router.put('/:id', partidaControlador.actualizar);

export default router; 