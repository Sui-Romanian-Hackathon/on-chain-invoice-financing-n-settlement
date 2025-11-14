#!/bin/bash
# makes sure the folder containing the script will be the root folder
cd "$(dirname "$0")" || exit

if [ ! -f ../../.env ]; then
  echo ".env file not found, creating one..."
  touch ../../.env
  cp ../../.env.example ../../.env
fi

source ../../.env
echo "PACKAGE_ID=$PACKAGE_ID"

if [ ! -f "$SUI_BIN" ]; then
    echo "Error: sui binary not found at $SUI_BIN"
    echo "Please update SUI_BIN variable in this script"
    exit 1
fi

function publish_contract() {
  echo "Publishing contract..."
  local OUTPUT=$($SUI_BIN client publish --gas-budget 100000000 2>&1)
  echo "$OUTPUT"
  
  local PACKAGE_ID=$(echo "$OUTPUT" | grep -oE 'PackageID: 0x[a-f0-9]+' | awk '{print $2}')
  
  if [ -n "$PACKAGE_ID" ]; then
    echo ""
    echo " [ SUCCESS ] Published package with ID: $PACKAGE_ID"
    echo ""
    echo "Add this to your .env file:"
    echo "PACKAGE_ID=$PACKAGE_ID"
    sed -i'' -e "s/^PACKAGE_ID=.*/PACKAGE_ID=$PACKAGE_ID/" ../../.env
  else
    echo " [ ERROR ] Failed to extract Package ID from output"
    exit 1
  fi
}

$1