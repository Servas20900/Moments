# syntax=docker/dockerfile:1
FROM node:20-alpine AS deps
WORKDIR /app
COPY backend/package*.json ./backend/
COPY web/package*.json ./web/
RUN cd backend; npm ci
RUN cd web; npm ci

FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl
COPY --from=deps /app/backend/node_modules ./backend/node_modules
COPY --from=deps /app/web/node_modules ./web/node_modules
COPY backend ./backend
COPY web ./web
RUN cd backend; npx prisma generate
RUN cd backend; npm run build
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN cd web; npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
RUN apk add --no-cache openssl
COPY backend/package*.json ./backend/
COPY --from=builder /app/backend/node_modules ./backend/node_modules
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/prisma ./backend/prisma
COPY --from=builder /app/web/dist /app/public
WORKDIR /app/backend
EXPOSE 3000
CMD ["node", "dist/main.js"]
