import { Router, Request, Response } from 'express';
import https from 'https';

const router = Router();

// Función para hacer petición HTTPS usando módulo nativo
function httpsRequest(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Connect4-App/1.0'
      }
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const jsonData = JSON.parse(data);
            resolve(jsonData);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
          }
        } catch (error) {
          reject(new Error('Error parsing JSON response'));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// GET /api/consultar-nombre/:identificacion - Consultar nombre por cédula
router.get('/:identificacion', async (req: Request, res: Response): Promise<void> => {
  try {
    const { identificacion } = req.params;
    
    console.log(`🔍 [BACKEND] Consultando nombre para cédula: ${identificacion}`);
    
    // Validar que la identificación tenga al menos 9 dígitos
    if (!identificacion || identificacion.length < 9) {
      console.log(`❌ Identificación inválida: ${identificacion}`);
      res.status(400).json({
        exito: false,
        mensaje: 'Identificación debe tener al menos 9 dígitos'
      });
      return;
    }

    console.log(`🌐 Llamando a API externa: https://apis.gometa.org/cedulas/${identificacion}`);

    // Hacer petición a la API externa usando HTTPS nativo
    const data = await httpsRequest(`https://apis.gometa.org/cedulas/${identificacion}`);
    
    console.log(`✅ Nombre encontrado en API externa:`, data);
    
    res.json({
      exito: true,
      datos: {
        identificacion,
        nombre: data.nombre || 'Nombre no disponible'
      }
    });

  } catch (error: any) {
    console.error('❌ [BACKEND] Error completo al consultar nombre:', error);
    console.error('❌ [BACKEND] Error message:', error?.message);
    
    // Si el error es que no se encontró, devolver respuesta de "no encontrado" en lugar de error 500
    if (error.message && error.message.includes('HTTP 404')) {
      res.json({
        exito: false,
        mensaje: 'Nombre no encontrado para esta identificación'
      });
      return;
    }
    
    res.status(500).json({
      exito: false,
      mensaje: 'Error interno del servidor al consultar nombre',
      error: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        name: error.name
      } : {}
    });
  }
});

export default router;
