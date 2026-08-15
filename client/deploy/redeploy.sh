#!/usr/bin/env bash
# Run this ON THE VPS (as root) to pull latest code, rebuild, and restart the web app.
set -euo pipefail

cd /var/www/thc-auction
git pull

cd client
npm install
npm run build

systemctl restart thc-auction-web
sleep 1
systemctl status thc-auction-web --no-pager
curl -sf http://127.0.0.1:3000 -o /dev/null && echo "web OK" || echo "web HEALTH CHECK FAILED"
