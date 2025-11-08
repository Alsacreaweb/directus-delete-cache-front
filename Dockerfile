FROM node:24-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .
RUN npm run build

FROM node:24-alpine AS runtime

WORKDIR /extension

# Only the built files
COPY --from=builder /app/dist ./dist
COPY package.json ./
