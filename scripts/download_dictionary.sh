#!/usr/bin/env bash
set -e

DATA_ROOT="data"
REMOTE='https://addons.mozilla.org/firefox/downloads/file/4110312/british_english_dictionary_gb-3.1.xpi'

SRC='scripts'
[ -d $SRCS ] || (echo "Run this script from project root"; exit 1)

###########################################
BASENAME=$(basename $REMOTE)
pushd $DATA_ROOT

TARGET_FOLDER='config/hunspell/en_EN'
UNZIPPED_FOLDER='hunspell_dict'
#####
# clean
rm -rf $UNZIPPED_FOLDER
rm -rf $TARGET_FOLDER

wget -c -r -O $BASENAME $REMOTE
unzip $BASENAME -d $UNZIPPED_FOLDER

mkdir -p $TARGET_FOLDER
cp -r $UNZIPPED_FOLDER/dictionaries/* $TARGET_FOLDER

cat << EOF > $TARGET_FOLDER/settings.yml
---
ignore_case:          true
strict_affix_parsing: true

EOF