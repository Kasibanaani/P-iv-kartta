#!/bin/sh
set -eu
cd "$(dirname "$0")"
node logiikka.cjs "$@"
