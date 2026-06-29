FROM node:18-alpine

WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Expose the API port
EXPOSE 5000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

CMD ["npm", "start"]
