import { Router } from 'express';
import { JugadorControlador } from '../controllers/JugadorControlador';

const router = Router();
const jugadorControlador = new JugadorControlador();

// GET /api/jugadores - Obtener todos los jugadores
router.get('/', jugadorControlador.obtenerTodos);

// GET /api/jugadores/:id - Obtener jugador por ID
router.get('/:id', jugadorControlador.obtenerPorId);

// POST /api/jugadores - Crear nuevo jugador
router.post('/', jugadorControlador.crear);

// PUT /api/jugadores/:id - Actualizar estadísticas de jugador
router.put('/:id', jugadorControlador.actualizarEstadisticas);

export default router; 