#!/bin/bash
echo "Starting nginx proxy"
docker stop rb-nginx-proxy && docker rm rb-nginx-proxy
sudo docker run -ti \
  --rm \
  -p 443:443 \
  -v /etc/ssl/private/star.endpoint.network:/etc/nginx/ssl/ \
  --name rb-nginx-proxy \
  --net br0 \
  --ip 172.18.1.2 \
  rb-nginx-proxy
