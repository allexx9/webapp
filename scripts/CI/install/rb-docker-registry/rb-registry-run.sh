#!/bin/bash

if [ "$#" -ne 1 ]; then
    echo "A domain is required."
    exit 1
fi

DOMAIN=$1

# sudo docker run -d -p 443:5000 \
#   --name docker-registry \
#   --restart=always \
#   -v ./auth:/auth \
#   -e "REGISTRY_AUTH=htpasswd" \
#   -e "REGISTRY_AUTH_HTPASSWD_REALM=Registry Realm" \
#   -e REGISTRY_AUTH_HTPASSWD_PATH=/auth/htpasswd \
#   -v /etc/letsencrypt/live/$DOMAIN:/certs \
#   -v ./data:/var/lib/registry \
#   -e REGISTRY_HTTP_ADDR=0.0.0.0:5000 \
#   -e REGISTRY_HTTP_HOST=$DOMAIN \
#   -e REGISTRY_HTTP_TLS_CERTIFICATE=/certs/$DOMAIN.crt \
#   -e REGISTRY_HTTP_TLS_KEY=/certs/$DOMAIN.key \
#   registry:2

  sudo docker run -d -p 443:5000 \
  --name docker-registry \
  --restart=always \
  -v "$(pwd)"/auth:/auth \
  -v /etc/ssl/private/star.endpoint.network:/certs \
  -v "$(pwd)"/data:/var/lib/registry \
  -e "REGISTRY_AUTH=htpasswd" \
  -e "REGISTRY_AUTH_HTPASSWD_REALM=Registry Realm" \
  -e REGISTRY_AUTH_HTPASSWD_PATH=/auth/htpasswd \
  -e REGISTRY_HTTP_ADDR=0.0.0.0:5000 \
  -e REGISTRY_HTTP_HOST=rb-registry.endpoint.network \
  -e REGISTRY_HTTP_TLS_CERTIFICATE=/certs/STAR_endpoint_network_plus_ca-bundle.crt \
  -e REGISTRY_HTTP_TLS_KEY=/certs/star.endpoint.network.key \
  registry:2
