FROM node:6.6.0

RUN apt-get update && \
    apt-get install -y
RUN npm install koa -g

 RUN mkdir -p /usr/src/app
 WORKDIR /usr/src/app
 

 EXPOSE  3000

CMD ["npm", "start"]
