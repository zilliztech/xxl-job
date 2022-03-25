ARG BUILD_IMAGE=maven:3.8.4-jdk-8-slim
ARG BASE_IMAGE=java:8


FROM ${BUILD_IMAGE} AS builder

COPY xxl-job-admin /usr/src/app/xxl-job-admin
COPY xxl-job-core  /usr/src/app/xxl-job-core
COPY xxl-job-executor-samples /usr/src/app/xl-job-executor-samples
COPY  pom.xml /usr/src/app

COPY settings.xml  /usr/share/maven/conf/settings.xml

WORKDIR /usr/src/app
RUN mvn clean package -U

# 基础镜像使用java
FROM ${BASE_IMAGE}
# 作者
MAINTAINER huwei <wei.hu@zilliz.com>
# VOLUME 指定了临时文件目录为/tmp。
# 其效果是在主机 /var/lib/docker 目录下创建了一个临时文件，并链接到容器的/tmp
VOLUME /tmp
# 将jar包添加到容器中并更名为app.jar
COPY --from=builder /usr/src/app/xxl-job-admin/target/xxl-job-admin-*.jar app.jar

# 运行jar包

ARG REVERSION=""
ARG GIT_REPO=""
ARG GIT_BRANCH=""
ARG GIT_COMMIT_HASH=""
LABEL GIT_COMMIT_HASH=${GIT_COMMIT_HASH} REVERSION=${REVERSION} GIT_BRANCH=${GIT_BRANCH} GIT_REPO=${GIT_REPO}

RUN bash -c 'touch /app.jar'
ENTRYPOINT ["java","-Djava.security.egd=file:/dev/./urandom","-jar","/app.jar"]