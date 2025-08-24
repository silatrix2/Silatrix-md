# Node 20 slim for smaller image
FROM node:20-slim

# install openssl and necessary fonts/ca-certificates (Baileys needs TLS)
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --omit=dev

COPY . .

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD [ "npm", "start" ]
