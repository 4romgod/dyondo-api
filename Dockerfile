FROM node:latest
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . ./
RUN npm install
RUN npm install pm2 -g
EXPOSE 8000
CMD ["pm2-runtime", "src/server.js"]