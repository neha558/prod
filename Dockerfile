FROM node:16.16.0-slim
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3001
CMD ["npm", "start", "prod"]
