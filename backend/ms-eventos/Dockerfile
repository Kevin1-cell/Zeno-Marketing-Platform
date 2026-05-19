FROM node:18-alpine3.18 AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm config set fetch-retries 5
RUN npm config set fetch-retry-mintimeout 20000
RUN npm config set fetch-retry-maxtimeout 120000
RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

FROM node:18-alpine3.18

RUN apk add --no-cache openssl

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

EXPOSE 3002

CMD ["./entrypoint.sh"]