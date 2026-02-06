FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

RUN npm run db:init

EXPOSE 3000

CMD ["npm", "start"]
