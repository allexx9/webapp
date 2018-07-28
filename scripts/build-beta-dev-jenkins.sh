#!/bin/bash
BRANCH=${GIT_BRANCH#*/}
NUMBER=$(git log --pretty=oneline | wc -l)
DATE=$(date +%Y.%m.%d)
TAG=$(git describe --tags `git rev-list --tags --max-count=1`)
HASH=$(git rev-parse --short HEAD)
echo $TAG-$BRANCH-$DATE+commit-$BRANCH-$NUMBER
echo "export const APP_VERSION = '$TAG-$BRANCH-$DATE+commit-$HASH-$NUMBER'" > src/_utils/version.js
echo "Removing debug logs..."
# find ./src -type f | xargs sed -i -E 's/^\s*console.(log|debug|info|)\((.*)\);?//gm'
echo "Building app..."
yarn build-beta
# npm run-script build-beta
echo "Done."