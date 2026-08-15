#!/usr/bin/env bash
# Run this ON THE VPS (as root) to pull latest code and restart the API.
set -euo pipefail

cd /var/www/thc-auction
git pull

cd server
source venv/bin/activate
pip install -r requirements.txt

systemctl restart thc-auction-api
sleep 1
systemctl status thc-auction-api --no-pager
curl -sf http://127.0.0.1:8000/health && echo " -> OK" || echo " -> HEALTH CHECK FAILED"
