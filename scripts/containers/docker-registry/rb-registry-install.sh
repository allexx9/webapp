#!/bin/bash
DOMAIN=docker-register.endpoint.network

# install letsencrypt
apt-get install git -y
# git clone https://github.com/letsencrypt/letsencrypt /opt/letsencrypt

# Generate SSL certificate for $domain
# /opt/letsencrypt/letsencrypt-auto certonly --keep-until-expiring --standalone -d $DOMAIN --email david@rigoblock.com -n --agree-tos

# Setup letsencrypt certificates renewing
line="30 2 * * 1 /opt/letsencrypt/letsencrypt-auto renew >> /var/log/letsencrypt-renew.log"
(crontab -u root -l; echo "$line" ) | crontab -u root -

# Rename SSL certificates
cd /etc/letsencrypt/live/$DOMAIN/
cp /etc/letsencrypt/live/$DOMAIN/privkey.pem /etc/letsencrypt/live/$DOMAIN/$DOMAIN.key

# Create directory to store images
mkdir /mnt/registry

# Create the certificates directory
mkdir ./certs
cp /etc/letsencrypt/live/$DOMAIN/privkey.pem ./certs/
cp /etc/letsencrypt/live/$DOMAIN/$DOMAIN.key ./certs/

# Create a password file
mkdir ./auth
docker run \
  --entrypoint htpasswd \
  registry:2 -Bbn rb-dev rb-dev-2018 > auth/htpasswd
docker container stop registry
