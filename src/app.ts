import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import dotenv from 'dotenv';

// Importar rutas
import jugadoresRutas from './routes/jugadores';
import partidasRutas from './routes/partidas';
import escalafonRutas from './routes/escalafon';
import consultarNombreRutas from './routes/consultar-nombre';

// Configurar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares de seguridad y logging
app.use(helmet());
app.use(morgan('combined'));
app.use(cors());

// Middlewares para parsear JSON y URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rutas de la API
app.use('/api/jugadores', jugadoresRutas);
app.use('/api/partidas', partidasRutas);
app.use('/api/escalafon', escalafonRutas);
app.use('/api/consultar-nombre', consultarNombreRutas);

// Ruta principal - servir el index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Middleware de manejo de errores
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    mensaje: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ mensaje: 'Ruta no encontrada' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor Connect4 ejecutándose en puerto ${PORT}`);
  console.log(`📁 Archivos estáticos desde: ${path.join(__dirname, 'public')}`);
  console.log(`🌐 Abrir en navegador: http://localhost:${PORT}`);
});

export default app; 