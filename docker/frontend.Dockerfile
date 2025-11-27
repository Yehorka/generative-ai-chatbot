# Build stage
FROM node:20-alpine AS builder
WORKDIR /frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend .
RUN npm run build || npm run build --if-present; \
  mkdir -p /frontend/build_artifact; \
  if [ -d build ]; then cp -r build/. /frontend/build_artifact/; \
  elif [ -d dist ]; then cp -r dist/. /frontend/build_artifact/; \
  else echo "No frontend build output found" && exit 1; fi

# Production stage
FROM nginx:stable-alpine

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built frontend assets
RUN mkdir -p /usr/share/nginx/html
COPY --from=builder /frontend/build_artifact /usr/share/nginx/html

# Static files from Django will be mounted at runtime
VOLUME ["/staticfiles"]

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
