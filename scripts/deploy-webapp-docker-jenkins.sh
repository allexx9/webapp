#!/bin/bash
NUMBER=$(git log --pretty=oneline | wc -l)
DATE=$(date +%Y.%m.%d)
TAG=$(git describe --tags `git rev-list --tags --max-count=1`)
HASH=$(git rev-parse --short HEAD)
BRANCH=${GIT_BRANCH#*/}
VERSION=$TAG-$BRANCH-$DATE-commit-$HASH-$NUMBER
echo 'rb-registry.endpoint.network/webapp-v1:$VERSION'

# Building the Docker image
docker build --quiet --no-cache -t webapp-v1 -f scripts/containers/beta-dev/Dockerfile .
docker login https://rb-registry.endpoint.network/ -u wnz99 -p $JENKINS_PASSWORD
docker tag webapp-v1 rb-registry.endpoint.network/webapp-v1:latest
docker tag webapp-v1 rb-registry.endpoint.network/webapp-v1:$VERSION
docker push rb-registry.endpoint.network/webapp-v1
docker push rb-registry.endpoint.network/webapp-v1:$VERSION

# Installing kubectl
curl -LO https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl \
  && chmod +x ./kubectl \
  && mv ./kubectl /usr/local/bin/kubectl
  
# Installing rancher CLI and deploying the image to Rancher
wget https://github.com/rancher/cli/releases/download/v2.0.3-rc1/rancher-linux-amd64-v2.0.3-rc1.tar.gz -O rancher-linux-amd64-v2.0.3-rc1.tar.gz \
  && tar xzvf rancher-linux-amd64-v2.0.3-rc1.tar.gz \
  && cd rancher-v2.0.3-rc1/ \
  && chmod +x rancher \
  && mv ./rancher /usr/local/bin/rancher \
  && echo "1" | rancher login https://rb-rancher.endpoint.network/v3 --token $RANCHER_TOKEN \
  && rancher kubectl set image deployment/webapp-v1-staging webapp-v1-staging=rb-registry.endpoint.network/webapp-v1:$VERSION