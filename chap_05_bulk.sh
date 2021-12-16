#!/usr/bin/env bash

set -e

PROT_HOST_PORT='http://localhost:9200'
BULKDATA='chap_05_bulkdata.ndjson'

curl \
    -XPOST "$PROT_HOST_PORT/_bulk?pretty" \
    --data-binary @"$BULKDATA"        \
    -H 'Content-Type:application/x-ndjson'