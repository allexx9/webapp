#!/bin/bash
BRANCH=$(git branch | sed -n -e 's/^\* \(.*\)/\1/p')
DATE=$(date +%Y.%m.%d)
TAG=$(git describe --tags `git rev-list --tags --max-count=1`)
HASH=$(git rev-parse --short HEAD)
echo "Version: $TAG-$BRANCH-$DATE+commit-$HASH"
GIT_VERSION=$TAG-$BRANCH-$DATE+commit-$HASH
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
cat <<EOF > src/_utils/version_git.js
export const GIT_HASH = ''
EOF
