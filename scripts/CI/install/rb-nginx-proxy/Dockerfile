FROM ubuntu
LABEL maintainer="david@rigoblock.com"
RUN apt-get update && \
    apt-get install nginx inetutils-ping -y && \
    apt-get clean && \
    rm -rf /tmp/* /var/tmp/* /var/lib/apt/archive/* /var/lib/apt/lists/*
# COPY default /etc/nginx/sites-enabled/default
ENTRYPOINT /usr/sbin/nginx -g "daemon off;"
EXPOSE 443