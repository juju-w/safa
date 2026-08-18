#!/bin/sh
# indexnow-push.sh — push SAFA's public URLs to IndexNow (Bing, Yandex, Seznam).
#
# The key file lives at website/public/<key>.txt and is deployed to the site
# root (https://juju-w.github.io/safa/<key>.txt) by the Pages build.
#
# Run after any deploy to request near-instant re-indexing:
#   ./scripts/indexnow-push.sh

set -eu
PATH=/usr/bin:/bin:/usr/sbin:/sbin
export PATH

key_file="$(ls website/public/*.txt | grep -v robots.txt | grep -v llms.txt | head -1 || true)"
if [ -z "$key_file" ]; then
  echo "error: no IndexNow key file found in website/public/" >&2
  exit 1
fi
key="$(cat "$key_file")"
base="https://juju-w.github.io/safa"

printf 'IndexNow key: %s\n' "$key"
printf 'Pushing: %s/ %s/how-it-works/ %s/live-demo/\n' "$base" "$base" "$base"

curl -sS "https://api.indexnow.org/indexnow?url=${base}/&url=${base}/how-it-works/&url=${base}/live-demo/&key=${key}"
printf '\n'
