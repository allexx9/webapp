#!/bin/bash

docker run -d -p 443:5000 \
  --name registry \
  --restart=always \
  -v `pwd`/auth:/auth \
  -e "REGISTRY_AUTH=htpasswd" \
  -e "REGISTRY_AUTH_HTPASSWD_REALM=Registry Realm" \
  -e REGISTRY_AUTH_HTPASSWD_PATH=/auth/htpasswd \
  -v `pwd`/certs:/certs \
  -v /mnt/registry:/var/lib/registry \
  -e REGISTRY_HTTP_ADDR=0.0.0.0:5000 \
  -e REGISTRY_HTTP_HOST=https://docker-register.endpoint.network \
  -e REGISTRY_HTTP_TLS_CERTIFICATE=/certs/docker-register.endpoint.network.crt \
  -e REGISTRY_HTTP_TLS_KEY=/certs/docker-register.endpoint.network.key \
  registry:2



