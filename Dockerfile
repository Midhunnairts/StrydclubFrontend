# ==========================================
# Stage 1: Build Angular Application
# ==========================================
FROM node:20-alpine AS build

WORKDIR /app

# Copy package descriptors and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application files
COPY . .

# Build the Angular application for production
RUN npm run build

# ==========================================
# Stage 2: Serve Application via Nginx
# ==========================================
FROM nginx:alpine

# Remove default Nginx website configuration
RUN rm -rf /usr/share/nginx/html/*

# Copy build output from Stage 1 to the Nginx HTML directory
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

# Copy custom Nginx configuration for Angular routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
