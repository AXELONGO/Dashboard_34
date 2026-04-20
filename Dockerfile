FROM node:18-alpine

WORKDIR /app

# Install dependencies first for caching
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Expose Vite port
EXPOSE 5173

# Run development server
CMD ["npm", "run", "dev", "--", "--host"]
