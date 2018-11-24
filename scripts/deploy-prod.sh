#!/bin/bash
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