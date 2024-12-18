# Base image for Node.js 20
FROM node:18-alpine3.20

# Set working directory in the container
WORKDIR /usr/src/app

# Copy package files first for better caching
COPY ../package*.json ../tsconfig.json ./

# Install dependencies
RUN npm install

# Copy the entire app source code
COPY ../ ./

# Build the TypeScript code
RUN npm run build

# Expose port
EXPOSE 5555

# Command to run the app (Sequelize migration happens in docker-compose)
CMD ["node", "dist/src/index.js"]
