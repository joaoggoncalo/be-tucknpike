# /backend/Dockerfile
FROM node:18-alpine

WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the source code
COPY . .

# Build the NestJS application
RUN npm run build

EXPOSE 3001

CMD ["node", "dist/main.js"]
