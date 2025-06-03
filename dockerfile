# Use official Node.js image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Install Prisma deps and others
RUN apk add --no-cache libc6-compat

# Copy package definition files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source code
COPY . .

RUN npx prisma generate

RUN npm run build

# Expose the application's port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]