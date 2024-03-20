FROM node:latest

WORKDIR /usr/src/app

# RUN npm init -y
RUN npm i typescript @types/node tsx -D
