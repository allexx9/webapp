 
#!/bin/bash

docker network create \
  --driver=bridge \
  --subnet 172.18.1.0/24 \
  --ip-range 172.18.1.0/24 \
  --gateway 172.18.1.1 \
  br0
./run-nginx.sh
./run-jenkins.sh
