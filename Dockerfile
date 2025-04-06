# Dockerfile
FROM node:18-alpine

WORKDIR /usr/src/app

# Install dependencies first (cached layer)
COPY package*.json ./
RUN npm install

# Copy the application source and build it
COPY . .
RUN npm run build

# Expose the port that the backend listens on
EXPOSE 3001

# Run the built application
CMD ["node", "dist/main.js"]
