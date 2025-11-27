FROM node:20-alpine

WORKDIR /frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend .

ENV HOST=0.0.0.0
ENV PORT=3090

EXPOSE 3090

CMD ["npm", "start"]
