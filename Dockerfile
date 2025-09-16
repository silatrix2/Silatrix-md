FROM node:lts-buster

RUN apt-get update && \
  apt-get install -y ffmpeg imagemagick webp && \
  rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

# Copy dependencies first
COPY package*.json ./

RUN npm install && npm install -g pm2

# Copy the rest of the files
COPY . .

EXPOSE 5000

CMD ["npm", "start"]
