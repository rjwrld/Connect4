const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔄 Probando conexión a la base de datos...');
    
    // Probar conexión básica
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Conexión exitosa:', result);
    
    // Probar consulta a tabla jugador
    console.log('🔄 Probando consulta a tabla jugador...');
    const jugadores = await prisma.jugador.findMany({
      take: 5
    });
    console.log('✅ Jugadores encontrados:', jugadores.length);
    
    // Probar creación de jugador
    console.log('🔄 Probando crear jugador de prueba...');
    const nuevoJugador = await prisma.jugador.create({
      data: {
        identificacion: BigInt('123456789'),
        nombre: 'Jugador de Prueba'
      }
    });
    console.log('✅ Jugador creado:', {
      ...nuevoJugador,
      identificacion: nuevoJugador.identificacion.toString()
    });
    
    // Eliminar jugador de prueba
    await prisma.jugador.delete({
      where: { id: nuevoJugador.id }
    });
    console.log('✅ Jugador de prueba eliminado');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
