const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.admin.upsert({
    where: { email: 'admin@zeno.com' },
    update: {},
    create: {
      nombre: 'Administrador Zeno',
      email: 'admin@zeno.com',
      password_hash: hashedPassword,
    },
  });
  console.log('✅ Admin creado: admin@zeno.com / admin123');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());