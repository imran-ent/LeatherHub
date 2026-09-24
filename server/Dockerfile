FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
# uploads needs to exist for multer diskStorage
RUN mkdir -p uploads
EXPOSE 5000
CMD ["node", "src/server.js"]
