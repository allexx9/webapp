#!/bin/bash
echo "Removing debug logs..."
find ./src -type f | xargs sed -i -E 's/^\s*console.(log|debug|info|)\((.*)\);?//gm'
echo "Building app..."
npm run-script build-beta
echo "Done."