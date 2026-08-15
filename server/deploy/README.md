# VPS deployment runbook

Server: Hostinger VPS `srv1896524.hstgr.cloud` (200.234.34.65)
API: FastAPI/uvicorn, systemd service `thc-auction-api`, reverse-proxied by Nginx at
`https://api.thehypecompany.in`, SSL via certbot (auto-renews).

Code lives at `/var/www/thc-auction` on the server, owned by user `deploy`.

## Deploying new changes

On your machine: `git push` as usual.

On the VPS (`ssh root@200.234.34.65`), run:
```bash
bash /var/www/thc-auction/server/deploy/redeploy.sh
```
This pulls, reinstalls deps, restarts the service, and checks `/health`.

Manual equivalent, if you want to do it step by step:
```bash
cd /var/www/thc-auction
git pull
cd server
source venv/bin/activate
pip install -r requirements.txt
systemctl restart thc-auction-api
systemctl status thc-auction-api
```

## Editing environment variables

The production `.env` lives only on the server (not in git) at:
```
/var/www/thc-auction/server/.env
```
Edit it with:
```bash
nano /var/www/thc-auction/server/.env
```
Then restart the service for changes to take effect:
```bash
systemctl restart thc-auction-api
```
Important: when the frontend is deployed, update `FRONTEND_URL` and `ALLOWED_ORIGINS`
in this file to the real frontend domain (currently set to localhost placeholders),
otherwise the browser will get CORS errors.

## Useful commands

Check the API is up:
```bash
systemctl status thc-auction-api
curl https://api.thehypecompany.in/health
```

Tail live logs:
```bash
journalctl -u thc-auction-api -f
```

Restart / stop / start:
```bash
systemctl restart thc-auction-api
systemctl stop thc-auction-api
systemctl start thc-auction-api
```

Check Nginx config and reload after editing it:
```bash
nginx -t
systemctl reload nginx
```

SSL cert renews automatically via a certbot timer. To check it / force a renewal:
```bash
systemctl status certbot.timer
certbot renew --dry-run
```

## If the site is down, check in this order
1. `systemctl status thc-auction-api` — is uvicorn actually running?
2. `journalctl -u thc-auction-api -n 50` — recent errors (often a bad `.env` value or
   missing dependency after a `git pull`).
3. `curl http://127.0.0.1:8000/health` — does the app respond locally at all?
4. `nginx -t` and `systemctl status nginx` — is the reverse proxy healthy?
