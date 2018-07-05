#!/bin/bash
# printenv
# NUMBER=$(cat BUILD_NUMBER) && export NUMBER
# echo $NUMBER
docker build --no-cache -t webapp-v1 -f scripts/containers/beta-dev/Dockerfile .
docker login https://rb-registry.endpoint.network/ -u wnz99 -p $JENKINS_PASSWORD
docker tag webapp-v1 rb-registry.endpoint.network/webapp-v1:$NUMBER
docker push rb-registry.endpoint.network/webapp-v1:$NUMBER
# printenv
curl -LO https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl
chmod +x ./kubectl
mv ./kubectl /usr/local/bin/kubectl
wget https://github.com/rancher/cli/releases/download/v2.0.3-rc1/rancher-linux-amd64-v2.0.3-rc1.tar.gz -O rancher-linux-amd64-v2.0.3-rc1.tar.gz
tar xzvf rancher-linux-amd64-v2.0.3-rc1.tar.gz && cd rancher-v2.0.3-rc1/ && chmod +x rancher
echo "1" | ./rancher login https://dev-03.endpoint.network --token $RANCHER_TOKEN
./rancher kubectl set image deployment/webapp-v1-staging webapp-v1-staging=rb-registry.endpoint.network/webapp-v1:$NUMBER

