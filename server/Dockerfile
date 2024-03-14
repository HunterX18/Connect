FROM node:21-alpine3.18

WORKDIR /usr/src/connect

COPY package.json ./

RUN npm install

COPY . .

EXPOSE 5000

CMD [ "npm", "start" ]