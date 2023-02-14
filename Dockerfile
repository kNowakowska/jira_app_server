FROM node:16.13.1-alpine3.14


WORKDIR /app

COPY package*.json ./

# generated prisma files
COPY prisma ./prisma/

COPY .env ./
COPY . .

RUN npm install
RUN npx prisma generate


CMD npm start
