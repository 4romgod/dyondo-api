FROM public.ecr.aws/b1k8j0m8/node
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . ./
RUN npm install --quiet
RUN npm install pm2 -g --quiet
EXPOSE 8000
CMD ["pm2-runtime", "src/server.js"]