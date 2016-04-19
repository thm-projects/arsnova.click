FROM java:openjdk-8-jdk
MAINTAINER Daniel Gerhardt <code@dgerhardt.net>

ENV GRADLE_VERSION 2.12
ENV GRADLE_FILE gradle-${GRADLE_VERSION}-bin.zip
ENV GRADLE_SHA e77064981906cd0476ff1e0de3e6fef747bd18e140960f1915cca8ff6c33ab5c
ENV PATH="/opt/gradle-$GRADLE_VERSION/bin:$PATH"

RUN curl -SLO "https://downloads.gradle.org/distributions/$GRADLE_FILE" && \
  echo "$GRADLE_SHA $GRADLE_FILE" | sha256sum -c - && \
  unzip "$GRADLE_FILE" -d /opt && \
  rm "$GRADLE_FILE"

CMD ["gradle"]
