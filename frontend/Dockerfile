FROM node:22.12.0-alpine
RUN npm install -g npm@11.11.1 && npm -v

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .