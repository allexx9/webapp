FROM ubuntu
LABEL maintainer="david@rigoblock.com"
RUN apt-get update && \
    apt-get install -y nginx apache2-utils && \
    apt-get clean && \
    rm -rf /tmp/* /var/tmp/* /var/lib/apt/archive/* /var/lib/apt/lists/* && \
    htpasswd -b -c /etc/nginx/.htpasswd rigoblock-dev rdev2018_ && \
    rm -rf /var/www/html/index.nginx-debian.html
COPY ./build/ /var/www/html/
COPY ./scripts/containers/beta-dev/nginx.default /etc/nginx/sites-enabled/default
ENTRYPOINT /usr/sbin/nginx -g "daemon off;"
EXPOSE 80