FROM node:20-alpine AS builder

# Argumentos que se pasan desde docker-compose.yml
ARG VITE_WS_PARTICIPANTES
ARG VITE_WS_SORTEOS

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Establecer las variables de entorno para el build de Vite
ENV VITE_WS_PARTICIPANTES=$VITE_WS_PARTICIPANTES
ENV VITE_WS_SORTEOS=$VITE_WS_SORTEOS
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]