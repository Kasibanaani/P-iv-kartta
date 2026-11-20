#!/bin/sh
set -eu
cd "$(dirname "$0")/../.."
node sarjakartta/testit/selain.js
