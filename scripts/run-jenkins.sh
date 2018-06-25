#!/bin/bash
echo "Jenkins docker started at http://localhost:8080"
docker run \
  --rm \
  -u root \
  -p 8080:8080 \
  -v jenkins-data:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v "$HOME":/home \
  --name jenkins \
  jenkinsci/blueocean
  
