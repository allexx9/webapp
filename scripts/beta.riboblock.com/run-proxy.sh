#!/bin/bash

if [ ! -f cert.pem ]; then
    echo "SSL certificate not found. Generating."
    openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365
fi
docker-compose up