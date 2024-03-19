FROM node:21-alpine3.18 as build

WORKDIR /usr/src/connect

COPY package.json ./

RUN npm install

COPY . .

RUN npm run build

FROM nginx

EXPOSE 3000 
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /usr/src/connect/build /usr/share/nginx/html

