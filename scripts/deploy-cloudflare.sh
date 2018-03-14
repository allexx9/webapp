#!/bin/bash
cd ../src
echo "Removing debug logs..."
find ./ -type f | xargs sed -i -E 's/^\s*console.(log|debug|info|)\((.*)\);?//gm'
echo "Setting app to production environment.."
sed -i 's/PROD = false/PROD = true/g' ./_utils/const.js
sed -i 's/WS = false/WS = true/g' ./_utils/const.js
cd ..
echo "Building app..."
echo "yarn build-beta"
yarn build-beta
echo "Done."