# Tumia Node.js LTS na Debian Bullseye
FROM node:lts-bullseye

# Install dependencies
RUN apt-get update && \
    apt-get install -y ffmpeg imagemagick webp && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /usr/src/app

# Copy dependency files
COPY package*.json ./

# Install npm packages + pm2 globally
RUN npm install && npm install -g pm2

# Copy the rest of the source code
COPY . .

# Expose port
EXPOSE 5000

# Start app with npm
CMD ["npm", "start"]
