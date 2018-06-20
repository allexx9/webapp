FROM ubuntu
LABEL maintainer="david@rigoblock.com"
RUN apt-get update
RUN apt-get install -y nginx apache2-utils
RUN htpasswd -b -c /etc/nginx/.htpasswd rigoblock-dev rdev2018_
RUN rm -rf /var/www/html/index.nginx-debian.html
COPY ./build/ /var/www/html/
COPY ./scripts/containers/beta/nginx.default /etc/nginx/sites-enabled/default
ENTRYPOINT /usr/sbin/nginx -g "daemon off;"
EXPOSE 80