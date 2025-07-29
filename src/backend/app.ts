import express from 'express';
import cors from 'cors';
import path from 'path';

// Importar rutas con la nueva estructura
import jugadoresRouter from './routes/jugadores';
import partidasRouter from './routes/partidas';
import escalafonRouter from './routes/escalafon';
import consultarNombreRouter from './routes/consultar-nombre';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Rutas de la API
app.use('/api/jugadores', jugadoresRouter);
app.use('/api/partidas', partidasRouter);
app.use('/api/escalafon', escalafonRouter);
app.use('/api/consultar-nombre', consultarNombreRouter);

// Ruta principal - servir index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Manejar rutas no encontradas
app.use('*', (req, res) => {
    res.status(404).json({ 
        error: 'Ruta no encontrada',
        message: `La ruta ${req.originalUrl} no existe`
    });
});

// Manejo de errores global
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({ 
        error: 'Error interno del servidor',
        message: err.message
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor iniciado en http://localhost:${PORT}`);
    console.log(`📁 Sirviendo frontend desde: ${path.join(__dirname, '../frontend')}`);
    console.log(`🗄️  Base de datos: ${process.env.DATABASE_URL ? 'Configurada' : 'No configurada'}`);
}); 