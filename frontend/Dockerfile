FROM node:22.12.0-alpine
RUN npm install -g npm@11.11.1 && npm -v

WORKDIR /app
RUN chown -R node:node /app

# Use the built-in non-root user so ownership matches runtime writes.
USER node

COPY --chown=node:node package*.json ./
RUN npm ci

COPY --chown=node:node . .