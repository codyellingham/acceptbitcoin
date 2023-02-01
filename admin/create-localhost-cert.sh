#!/bin/bash
set -euxo pipefail

if [[ $EUID -ne 0  ]]; then
  echo "This script must be run as root"
  exit 1
fi

mkdir -p /etc/letsencrypt/live/acceptbitcoin.com

openssl req -x509 -out /etc/letsencrypt/live/acceptbitcoin.com/fullchain.pem -keyout /etc/letsencrypt/live/acceptbitcoin.com/privkey.pem -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost' -extensions EXT -config <( printf "[dn]\nCN=localhost\n[req]\ndistinguished_name = dn\n[EXT]\nsubjectAltName=DNS:localhost\nkeyUsage=digitalSignature\nextendedKeyUsage=serverAuth")

chmod -R 705 /etc/letsencrypt/live
