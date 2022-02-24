FROM node:16
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . ./
RUN npm install --verbose
RUN npm install pm2 -g
EXPOSE 8000
CMD [ "npm", "start" ]