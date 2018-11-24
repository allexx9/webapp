#!/bin/bash
BRANCH=$(git branch | sed -n -e 's/^\* \(.*\)/\1/p')
NUMBER=$(git log --pretty=oneline | wc -l)
DATE=$(date +%Y.%m.%d)
TAG=$(git describe --tags `git rev-list --tags --max-count=1`)
HASH=$(git rev-parse --short HEAD)
echo $TAG-$BRANCH-$DATE+commit-$HASH-$NUMBER
GIT_VERSION=$TAG-$BRANCH-$DATE+commit-$HASH-$NUMBER
cat <<EOF > src/_utils/version_git.js
export const GIT_HASH = '$GIT_VERSION'
EOF
echo "Building app..."
echo "build-prod"
yarn build
echo "Done."

cat <<EOF > build/service-worker.js
self.addEventListener('install', function(e) {
  self.skipWaiting()
})

self.addEventListener('activate', function(e) {
  self.registration
    .unregister()
    .then(function() {
      return self.clients.matchAll()
    })
    .then(function(clients) {
      clients.forEach(client => client.navigate(client.url))
    })
})
EOF