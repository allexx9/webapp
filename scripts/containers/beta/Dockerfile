FROM ubuntu
LABEL maintainer="david@rigoblock.com"
RUN apt-get update
RUN apt-get install -y nginx
RUN rm -rf /var/www/html/index.nginx-debian.html
COPY ./build/ /var/www/html/
ENTRYPOINT /usr/sbin/nginx -g "daemon off;"
EXPOSE 80