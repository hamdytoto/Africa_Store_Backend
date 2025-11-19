# Step 1: Use Node.js base image
FROM node:22-alpine AS builder

# Step 2: Set working directory
WORKDIR /app

# Step 3: Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Step 4: Copy rest of the code
COPY . .    

# Step 5: Build NestJS project
RUN npm run build

# ---- Production Stage ----
FROM node:22-alpine AS production

WORKDIR /app

# Copy only necessary files
COPY package*.json ./
RUN npm install --only=production

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Command to run the app
CMD ["node", "dist/main.js"]