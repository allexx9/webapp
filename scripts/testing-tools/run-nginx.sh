#!/bin/bash
docker stop rb-nginx-proxy && docker rm rb-nginx-proxy
sudo docker run -ti \
  -p 443:443 \
  -v /etc/ssl/private/star.endpoint.network:/etc/nginx/ssl/ \
  --ip 172.18.0.2 \
  --name rb-nginx-proxy \
  rb-nginx-proxy