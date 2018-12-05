#!/bin/bash
export SENTRY_AUTH_TOKEN=0d03db2b44f34fc58754b56fedc0b1836c58e8c6a7354d5fa80fabff998f9bcf
export SENTRY_ORG=rigoblock
export SENTRY_PROJ=webapp-v1
# VERSION=$(sentry-cli releases propose-version)
BRANCH=$(git branch | sed -n -e 's/^\* \(.*\)/\1/p')
DATE=$(date +%Y.%m.%d)
TAG=$(git describe --tags `git rev-list --tags --max-count=1`)
HASH=$(git rev-parse --short HEAD)
echo $TAG-$BRANCH-$DATE+commit-$HASH
GIT_VERSION=$TAG-$BRANCH-$DATE+commit-$HASH

ENVIRONMENT="Production"

# Create a release
sentry-cli releases new -p $SENTRY_PROJ $GIT_VERSION

# Associate commits with the release
sentry-cli releases set-commits --auto $GIT_VERSION

# Let Sentry know you’ve deployed
sentry-cli releases deploys $GIT_VERSION new -e $ENVIRONMENT

# sentry-cli releases -o $SENTRY_ORG -p $SENTRY_PROJ files \
#   $GIT_VERSION upload-sourcemaps --log-level=debug --no-rewrite --validate --url-prefix \
#   https://beta.rigoblock.com/static build/static/js

