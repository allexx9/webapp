#!/bin/bash
CWD=$(pwd)
DEST_DIR="app_build"
mkdir $DEST_DIR
# DEST_DIR=/home/rigoblock/html/beta.rigoblock.com/app/
if [ ! -d "$DEST_DIR" ]; then
  echo "Destination build directory does not exist. Exiting."
  exit 1
fi
echo "Deleting previous build..."
cd $DEST_DIR && rm -rf *
echo "Copying file to build directory..."
cd $CWD
cp -Rp * $DEST_DIR/
echo "Deleting previous build..."
cd $DEST_DIR/src
ls *
echo "Removing debug logs..."
# find ./ -type f | xargs sed -i -E 's/^\s*console.(log|debug|info|warn|)\((.*)\);?//gm'
cd $CWD/$DEST_DIR
echo "Building app..."
echo "build-beta"
yarn build-beta
echo "Done."
cd $CWD

