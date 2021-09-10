FROM node:10-alpine as builder

WORKDIR /opt/app

ARG NPM_TOKEN

COPY .npmrc /opt/app/.npmrc
COPY .npmrc projects/aitheon/core-client/.npmrc
COPY package.json /opt/app/package.json
COPY package-lock.json /opt/app/package-lock.json

COPY projects/aitheon/core-client/package.json /opt/app/projects/aitheon/core-client/package.json
COPY projects/aitheon/core-client/package-lock.json /opt/app/projects/aitheon/core-client/package-lock.json

RUN npm i
RUN cd projects/aitheon/core-client && npm i && cd ../../..

COPY . /opt/app

RUN npm run pub:lib
