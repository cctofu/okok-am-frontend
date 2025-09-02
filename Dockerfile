# TODO Start: [Student] Complete Dockerfile
# stage 0: build
FROM node:18 AS build

ENV FRONTEND=/opt/frontend

WORKDIR $FRONTEND

COPY . .

RUN yarn config set registry https://registry.npm.taobao.org/

RUN yarn install

RUN yarn run build

RUN yarn run export

# stage 1
FROM nginx:1.22

ENV HOME=/opt/app

WORKDIR $HOME

COPY --from=build /opt/frontend/out dist

COPY nginx /etc/nginx/conf.d

EXPOSE 80
# TODO End