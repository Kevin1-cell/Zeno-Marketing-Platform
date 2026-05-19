# Zeno-Marketing-Platform
Zeno Marketing – Gestión de Sorteos  

# Forma de arranque

MOTOR DEL BACKEND 
pnpm start:dev

MOTOR DEL FRONTEND
npm run dev

MOTOR DE BASE DE DATOS
cd backend\shared
pnpm prisma studio

# Crear imagenes de contenedores-Docker
docker build --no-cache -t zeno-ms-auth ./backend/ms-auth
docker build --no-cache -t zeno-ms-eventos ./backend/ms-eventos
docker build --no-cache -t zeno-ms-participantes ./backend/ms-participantes
docker build --no-cache -t zeno-ms-sorteos ./backend/ms-sorteos

# Levantar imagen docker
docker run --rm -p 3001:3001 --env-file ./backend/ms-auth/.env --name ms-auth zeno-ms-auth
docker run --rm -p 3002:3002 --env-file ./backend/ms-eventos/.env --name ms-eventos zeno-ms-eventos
docker run --rm -p 3003:3003 --env-file ./backend/ms-participantes/.env --name ms-participantes zeno-ms-participantes
docker run --rm -p 3004:3004 --env-file ./backend/ms-sorteos/.env --name ms-sorteos zeno-ms-sorteos

# Motor de arranque del docker compose
docker-compose up --build -> Levanta todo el programa.

# Revisar si hay o no hay contenedores.
docker-compose down   # Para detener contenedores anteriores si los hay
docker-compose up --build


# Eliminar Base de datos
cd backend/shared
node clear-db.js

# Local para ejecutrarlo en google
http://localhost:5173
