FROM debian:jessie
MAINTAINER Daniel Gerhardt <code@dgerhardt.net>

ENV NPM_CONFIG_LOGLEVEL info
ENV NODE_VERSION 4.4.3
ENV METEOR_VERSION 1.3.2.1
ENV METEOR_TARBALL_FILE meteor-bootstrap-os.linux.x86_64.tar.gz
ENV METEOR_TARBALL_URL https://d3sqy0vbqsdhku.cloudfront.net/packages-bootstrap/$METEOR_VERSION/$METEOR_TARBALL_FILE
ENV METEOR_WAREHOUSE_DIR /opt/meteor
ENV PATH "$METEOR_WAREHOUSE_DIR:$PATH"

RUN apt-get update && \
  apt-get install -y curl openssh-client

# Node.JS

# gpg keys listed at https://github.com/nodejs/node
RUN set -ex \
  && for key in \
    9554F04D7259F04124DE6B476D5A82AC7E37093B \
    94AE36675C464D64BAFA68DD7434390BDBE9B9C5 \
    0034A06D9D9B0064CE8ADF6BF1747F4AD2306D93 \
    FD3A5288F042B6850C66B31F09FE44734EB7990E \
    71DCFD284A79C3B38668286BC97EC7A07EDE3FC1 \
    DD8F2338BAE7501E3DD5AC78C273792F7D83545D \
    B9AE9905FFD7803F25714661B63B535A4C206CA9 \
    C4F0DFFF4E8C1A8236409D08E73BC641CC11F4C8 \
  ; do \
    gpg --keyserver ha.pool.sks-keyservers.net --recv-keys "$key"; \
  done

RUN curl -SLO "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64.tar.gz" && \
  curl -SLO "https://nodejs.org/dist/v$NODE_VERSION/SHASUMS256.txt.asc" && \
  gpg --verify SHASUMS256.txt.asc && \
  grep " node-v$NODE_VERSION-linux-x64.tar.gz\$" SHASUMS256.txt.asc | sha256sum -c - && \
  tar -xzf "node-v$NODE_VERSION-linux-x64.tar.gz" -C /usr/local --strip-components=1 && \
  rm "node-v$NODE_VERSION-linux-x64.tar.gz" SHASUMS256.txt.asc

RUN npm install -g npm && \
  npm install -g grunt-cli gulp-cli

# Meteor

RUN mkdir /opt/meteor && \
  curl -SLO "$METEOR_TARBALL_URL" && \
  tar -xzf "$METEOR_TARBALL_FILE" -C "$METEOR_WAREHOUSE_DIR" --strip-components=1 && \
  rm "$METEOR_TARBALL_FILE"
