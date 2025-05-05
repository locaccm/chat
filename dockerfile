# Use official Node.js image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package definition files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source code
COPY . .

# Expose the application's port
EXPOSE 3000

# Start the application
CMD ["node", "src/start.js"]