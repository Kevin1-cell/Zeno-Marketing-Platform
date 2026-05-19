const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clear() {
  try {
    console.log('🗑️  Eliminando ganadores...');
    await prisma.ganador.deleteMany({});
    console.log('🗑️  Eliminando participantes...');
    await prisma.participante.deleteMany({});
    console.log('🗑️  Eliminando sorteos...');
    await prisma.sorteo.deleteMany({});
    console.log('🗑️  Eliminando eventos...');
    await prisma.evento.deleteMany({});
    console.log('✅ Todos los datos de eventos, participantes, sorteos y ganadores han sido eliminados.');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clear();