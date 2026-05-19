#!/bin/sh
set -e

echo "Sincronizando schema con la base de datos..."
npx prisma db push --accept-data-loss

echo "Corriendo seed..."
node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();
bcrypt.hash('admin123', 10).then(hash => {
  return prisma.admin.upsert({
    where: { email: 'admin@zeno.com' },
    update: {},
    create: { nombre: 'Administrador Zeno', email: 'admin@zeno.com', password_hash: hash }
  });
}).then(() => {
  console.log('✅ Admin creado');
  return prisma.\$disconnect();
});
"

echo "Arrancando ms-auth..."
exec node dist/main