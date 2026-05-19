FROM node:20-alpine AS builder

ARG VITE_WS_PARTICIPANTES
ARG VITE_WS_SORTEOS

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ENV VITE_WS_PARTICIPANTES=$VITE_WS_PARTICIPANTES
ENV VITE_WS_SORTEOS=$VITE_WS_SORTEOS
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/templates/default.conf.template
EXPOSE 80
CMD ["/bin/sh", "-c", "envsubst '${MS_AUTH_HOST} ${MS_AUTH_PORT} ${MS_EVENTOS_HOST} ${MS_EVENTOS_PORT} ${MS_PARTICIPANTES_HOST} ${MS_PARTICIPANTES_PORT} ${MS_SORTEOS_HOST} ${MS_SORTEOS_PORT}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && sed -i \"s/listen 80/listen ${PORT:-80}/g\" /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]