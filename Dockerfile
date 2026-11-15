# -------------------------------------------------------------
# Stage 1: Build Home Frame React/Vite PWA
# -------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies with caching
COPY package.json package-lock.json* ./
RUN npm ci || npm install

# Copy source files
COPY . .

# Compile TypeScript and build production bundle
RUN npm run build

# -------------------------------------------------------------
# Stage 2: Production Nginx Server
# -------------------------------------------------------------
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx configuration for SPA & PWA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
