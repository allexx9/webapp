#!/bin/bash
CWD=$(pwd)
DEST_DIR=/home/rigoblock/html/beta.endpoint.network/app/
if [ ! -d "$DEST_DIR" ]; then
  echo "Destination build directory does not exist. Exiting."
  exit 1
fi
echo "Deleting previous build..."
cd $DEST_DIR && rm -rf *
echo "Copying file to build directory..."
cp $CWD/* -Rp $DEST_DIR
echo "Deleting previous build..."
cd src
echo "Removing debug logs..."
# find ./ -type f | xargs sed -E 's/console.(log|debug|info|...|count)\((.*)\);?//g'
cd ..
echo "Building app..."
yarn build-parity
echo "Done."
cd $CWD

