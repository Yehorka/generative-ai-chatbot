# Build stage
FROM node:20-alpine AS builder
WORKDIR /frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend .
RUN npm run build || npm run build --if-present

# Production stage
FROM nginx:stable-alpine

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built frontend assets
RUN mkdir -p /usr/share/nginx/html
COPY --from=builder /frontend/build /usr/share/nginx/html 2>/dev/null || true
COPY --from=builder /frontend/dist /usr/share/nginx/html 2>/dev/null || true

# Static files from Django will be mounted at runtime
VOLUME ["/staticfiles"]

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
