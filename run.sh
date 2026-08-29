#!/usr/bin/env bash
# Single entrypoint for common project commands. Run from repo root.
set -e
cd "$(dirname "$0")"

case "$1" in
  api)
    node Backend/server.js
    ;;

  web)
    (cd ReportShooting && npm run dev)
    ;;

  build)
    (cd ReportShooting && npm run build)
    ;;

  etl|data)
    python3 ETLpipeline/etlPipeline.py
    ;;

  start)
    mkdir -p .run
    nohup node Backend/server.js > .run/backend.log 2>&1 & echo $! > .run/backend.pid
    (cd ReportShooting && nohup npm run dev > ../.run/frontend.log 2>&1 & echo $! > ../.run/frontend.pid)
    echo "api:  http://localhost:3000  (log: .run/backend.log)"
    echo "web:  http://localhost:5173  (log: .run/frontend.log)"
    ;;

  stop)
    kill "$(cat .run/backend.pid 2>/dev/null)" 2>/dev/null
    kill "$(cat .run/frontend.pid 2>/dev/null)" 2>/dev/null
    echo "stopped"
    ;;

  *)
    echo "Usage: ./run.sh <command>"
    echo "  api    - start the backend API (foreground)"
    echo "  web    - start the frontend dev server (foreground)"
    echo "  build  - build the frontend for production"
    echo "  etl    - pull data and rebuild the SQLite database"
    echo "  start  - start api + web together in the background"
    echo "  stop   - stop the background api + web"
    exit 1
    ;;
esac
