#!/bin/bash

# if error x509: certificate signed by unknown authority
# 2 solutions

#  1) Client side: install CA certificate

#  cd /etc/docker/certs.d
#  mkdir docker.io
#  cd docker.io
#  ln -s /etc/pki/tls/certs/ca-bundle.crt
#  ln -s /etc/pki/tls/certs/ca-bundle.trust.crt
#  systemctl restart docker

#  2) Server side: merge CA and crt

# https://github.com/docker/distribution/issues/1184#issuecomment-219390523

# cat STAR_endpoint_network.crt STAR_endpoint_network.ca-bundle > STAR_endpoint_network_plus_ca-bundle.crt 

if [ "$#" -ne 2 ]; then
    echo "A domain and email are required."
    echo ""
    echo "./rb-registry-install.sh mydomain.com user@mydomain.com"
    exit 1
fi

DOMAIN=$1
EMAIL=$2

# Create directory to store images
mkdir ./data

# install letsencrypt
sudo apt-get install git -y
sudo git clone https://github.com/letsencrypt/letsencrypt /opt/letsencrypt

# Generate SSL certificate for $domain
sudo /opt/letsencrypt/letsencrypt-auto certonly \
--keep-until-expiring --standalone -d $DOMAIN --email $EMAIL -n --agree-tos

# Setup letsencrypt certificates renewing
line="30 2 * * 1 /opt/letsencrypt/letsencrypt-auto renew >> /var/log/letsencrypt-renew.log"
(sudo crontab -u root -l; echo "$line" ) | sudo crontab -u root -

# Rename SSL certificates
sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem /etc/letsencrypt/live/$DOMAIN/$DOMAIN.key
sudo cat /etc/letsencrypt/live/$DOMAIN/cert.pem /etc/letsencrypt/live/$DOMAIN/chain.pem > /etc/letsencrypt/live/$DOMAIN/$DOMAIN.crt


# Create a password file
mkdir ./auth
docker run \
  --name docker-registry \
  --entrypoint htpasswd \
  registry:2 -Bbn rb-dev rb-dev-2018 > auth/htpasswd
docker container stop docker-registry
cp ./auth/htpasswd ../data/auth/
