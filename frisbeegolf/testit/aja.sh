#!/bin/sh
set -eu
cd "$(dirname "$0")/../.."
node frisbeegolf/testit/logiikka.js
node frisbeegolf/testit/selain.js
