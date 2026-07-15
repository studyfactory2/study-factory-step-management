#!/bin/sh
set -eu

mkdir -p /backups

while true; do
  timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
  pg_dump --format=custom --no-owner --no-acl --file="/backups/${PGDATABASE}-${timestamp}.dump"
  find /backups -type f -name '*.dump' -mtime "+${BACKUP_RETENTION_DAYS:-7}" -delete
  sleep 86400
done
