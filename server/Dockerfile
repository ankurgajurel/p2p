FROM node:18-alpine

WORKDIR /app

COPY package.json ./
RUN npm i --production

COPY . .

EXPOSE 7001

CMD ["npm", "run", "dev"]