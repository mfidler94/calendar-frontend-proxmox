FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_API_BASE=/api
ARG VITE_BASE=/
ENV VITE_API_BASE=$VITE_API_BASE
ENV VITE_BASE=$VITE_BASE

RUN node node_modules/vite/bin/vite.js build

FROM nginx:1.27-alpine

COPY default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
