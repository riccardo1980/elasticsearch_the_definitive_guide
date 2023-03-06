#!/usr/bin/env bash
set -e

SRC='es-plugin-docker-compose'
[ -d $SRCS ] || (echo "Run this script from project root"; exit 1)


pushd $SRC
. .env
docker build --build-arg STACK_VERSION=${STACK_VERSION} -t elastic-plugin:${STACK_VERSION} .