import { Router } from 'express';
import { EscalafonControlador } from '../controllers/EscalafonControlador';

const router = Router();
const escalafonControlador = new EscalafonControlador();

// GET /api/escalafon - Obtener escalafón de jugadores ordenado por marcador
router.get('/', escalafonControlador.obtenerEscalafon);

export default router; 