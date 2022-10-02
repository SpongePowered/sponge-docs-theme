#------- Build

FROM alpine:latest as builder

ARG GITHUB_USER
ARG GITHUB_TOKEN
ARG CROWDIN_TOKEN
ARG CROWDIN_PROJECT_ID
ARG CROWDIN_BASE_URL
ARG BASE_URL

WORKDIR /app

RUN apk add --no-cache nodejs npm

# This caches node install in docker builds
COPY package.json /app/package.json
RUN npm install

COPY . /app
RUN ./node_modules/.bin/gulp homepage:build

#------- Copy to nginx

FROM nginx:1.23.1-alpine

COPY --from=builder /app/dist/homepage /usr/share/nginx/html
