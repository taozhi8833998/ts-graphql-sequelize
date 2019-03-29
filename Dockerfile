FROM keymetrics/pm2:latest-alpine
LABEL maintainer="taozhi.tz<taozhi.tz@alibaba-inc.com>"

RUN apk --update add --no-cache curl vim
# echo node
RUN node -v && npm -v

# DEFAULT ENV
ENV APP=open_dev RELEASE_DIR=out/release BASE_DIR=/home/admin

# Build
RUN mkdir -p $BASE_DIR/target/ganjiang/$APP/$RELEASE_DIR $BASE_DIR/target/ganjiang/$APP/logs

# Bundle APP files
COPY out/release/ $BASE_DIR/target/ganjiang/$APP/

# Set Run ENV
USER root
WORKDIR $BASE_DIR/target/ganjiang/$APP

# Install app dependencies
RUN npm install --production --registry=https://registry.npm.taobao.org

# APP EntryPoint
ENTRYPOINT node ./bin/genProcess.js > ./pm2.json && pm2-runtime start pm2.json