FROM node:lts-slim

RUN npm install -g pnpm@latest

WORKDIR /app

EXPOSE 3000 4000
