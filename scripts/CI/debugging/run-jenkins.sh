#!/bin/bash
echo "Starting Jenkins"
docker stop rb-jenkins && docker rm rb-jenkins
ip addr add 172.18.1.3 dev br0
docker run \
  --rm \
  -u root \
  -v jenkins-data:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v "$HOME":/home \
  --name rb-jenkins \
  --net=br0 \
  --ip=172.18.1.3 \
  -p 127.0.0.1:8080:8080 \
  jenkinsci/blueocean
