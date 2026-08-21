#!/usr/bin/env bash
# Run this ON THE VPS (as root) after you've pushed changes.
# Pulls latest code once, then rebuilds/restarts both the API and the web app.
set -euo pipefail

REPO=/var/www/thc-auction

echo "== git pull =="
cd "$REPO"
git pull

echo "== backend: install deps + restart =="
cd "$REPO/server"
source venv/bin/activate
pip install -r requirements.txt
deactivate
systemctl restart thc-auction-api

echo "== activity simulator: refresh unit files + timer =="
cp deploy/thc-auction-simulate.service deploy/thc-auction-simulate.timer /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now thc-auction-simulate.timer

echo "== frontend: install deps + build + restart =="
cd "$REPO/client"
npm install
npm run build
systemctl restart thc-auction-web

echo "== health checks =="
sleep 2
systemctl is-active --quiet thc-auction-api && echo "api service: active" || echo "api service: NOT ACTIVE"
systemctl is-active --quiet thc-auction-web && echo "web service: active" || echo "web service: NOT ACTIVE"
curl -sf http://127.0.0.1:8000/health -o /dev/null && echo "api /health: OK" || echo "api /health: FAILED"
curl -sf http://127.0.0.1:3000 -o /dev/null && echo "web /: OK" || echo "web /: FAILED"

echo "== done =="
