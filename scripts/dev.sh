#!/usr/bin/env bash
set -e

npm --prefix backend run dev &
BACK_PID=$!

npm --prefix frontend run dev &
FRONT_PID=$!

trap 'kill $BACK_PID $FRONT_PID 2>/dev/null' EXIT INT TERM

wait
