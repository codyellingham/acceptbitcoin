#!/bin/bash
set -euxo pipefail

tmux -2 new-session -d -s DEV
tmux rename-window 'LETS'
tmux send-keys '' C-m

tmux new-window -t DEV:1
tmux rename-window 'BTC'
tmux send-keys 'bitcoind -regtest -daemon; while ! bitcoin-cli -regtest echo; do sleep 1; done; bitcoin-cli -regtest generatetoaddress 100 bcrt1q8feg0jnn0hm27qtp36eh4khrgwtqxe647gydx7; sleep 1; lightningd --network=regtest --daemon --autocleaninvoice-cycle=14400 --lightning-dir=/home/c/.lightning --log-file=/home/c/.lightning/regtest/debug.log --addr=:9735; lightningd --network=regtest --daemon --autocleaninvoice-cycle=14400 --lightning-dir=/home/c/.lightning2 --log-file=/home/c/.lightning2/regtest/debug.log --addr=:9736; tail -f /home/c/.bitcoin/regtest/debug.log'  C-m

tmux new-window -t DEV:2
tmux rename-window 'CLIT1'
tmux send-keys 'while ! lightning-cli --network=regtest getinfo; do sleep 1; done; tail -f /home/c/.lightning/regtest/debug.log'  C-m

tmux new-window -t DEV:3
tmux rename-window 'CLIT2'
tmux send-keys 'while ! lightning-cli --network=regtest --lightning-dir=/home/c/.lightning2 getinfo; do sleep 1; done; tail -f /home/c/.lightning2/regtest/debug.log'  C-m

tmux new-window -t DEV:4
tmux send-keys 'git status'  C-m
tmux send-keys 'lightning-cli --network=regtest --lightning-dir=/home/c/.lightning '  C-m

tmux new-window -t DEV:5
tmux rename-window 'ABTC'
tmux send-keys 'while ! lightning-cli --network=regtest getinfo; do sleep 1; done; node src/server.js /home/c/.lightning/regtest/lightning-rpc &'
tmux send-keys 'while INOTIFY_RES=$(inotifywait -r -e create -e delete -e modify -e move src); do kill $!; node src/server.js /home/c/.lightning/regtest/lightning-rpc & done' C-m

tmux -2 attach-session -t DEV
