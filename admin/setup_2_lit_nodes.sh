#!/bin/bash
set -euxo pipefail

NEW_ADDR_lightning=$(lightning-cli --network regtest --lightning-dir=/home/c/.lightning newaddr | cut -c15-58 | sed -n 2p)

NEW_ADDR_lightning2=$(lightning-cli --network regtest --lightning-dir=/home/c/.lightning2 newaddr | cut -c15-58 | sed -n 2p)

sleep 5

bitcoin-cli -regtest generatetoaddress 101 $NEW_ADDR_lightning

sleep 60

bitcoin-cli -regtest generatetoaddress 40 $NEW_ADDR_lightning2
sleep 30

lightning-cli --network regtest --lightning-dir=/home/c/.lightning listfunds
lightning-cli --network regtest --lightning-dir=/home/c/.lightning2 listfunds

NODE_ID_lightning=$(lightning-cli --network regtest --lightning-dir=/home/c/.lightning getinfo | grep 'id' | cut -c11-76)

NODE_ID_lightning2=$(lightning-cli --network regtest --lightning-dir=/home/c/.lightning2 getinfo | grep 'id' | cut -c11-76)


lightning-cli --network regtest --lightning-dir=/home/c/.lightning connect $NODE_ID_lightning2@localhost:9736

lightning-cli --network regtest --lightning-dir=/home/c/.lightning2 connect $NODE_ID_lightning@localhost:9735

sleep 5

lightning-cli --network regtest --lightning-dir=/home/c/.lightning fundchannel $NODE_ID_lightning2 10000000

sleep 5

bitcoin-cli -regtest generatetoaddress 101 $NEW_ADDR_lightning

sleep 60

INVOICE=$(lightning-cli --network regtest --lightning-dir=/home/c/.lightning2 invoice 1000000000 "$(date)" "bla" | grep 'bolt11' | cut -c15-277)

sleep 10

lightning-cli --network regtest --lightning-dir=/home/c/.lightning pay $INVOICE

sleep 5

lightning-cli --network regtest --lightning-dir=/home/c/.lightning listfunds
lightning-cli --network regtest --lightning-dir=/home/c/.lightning listchannels
lightning-cli --network regtest --lightning-dir=/home/c/.lightning listpeers

lightning-cli --network regtest --lightning-dir=/home/c/.lightning2 listfunds
lightning-cli --network regtest --lightning-dir=/home/c/.lightning2 listchannels
lightning-cli --network regtest --lightning-dir=/home/c/.lightning2 listpeers


bitcoin-cli -regtest generatetoaddress 2 $NEW_ADDR_lightning
sleep 10

# stop so bitcoin can save its state
bitcoin-cli -regtest stop
sleep 30
# and restart
bitcoind -regtest -daemon
