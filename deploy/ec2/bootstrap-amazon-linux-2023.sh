#!/bin/bash
set -euo pipefail

dnf update -y
dnf install -y docker
systemctl enable --now docker
usermod -aG docker ec2-user

mkdir -p /usr/local/lib/docker/cli-plugins
architecture="$(uname -m)"
case "$architecture" in
  x86_64) compose_arch="x86_64" ;;
  aarch64) compose_arch="aarch64" ;;
  *) echo "Unsupported architecture: $architecture" >&2; exit 1 ;;
esac

compose_version="v2.32.4"
curl --fail --location \
  "https://github.com/docker/compose/releases/download/${compose_version}/docker-compose-linux-${compose_arch}" \
  --output /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

mkdir -p /opt/study-factory
chown ec2-user:ec2-user /opt/study-factory
chmod 750 /opt/study-factory
docker compose version

echo "Create /opt/study-factory/.env from deploy/.env.production.example before the first deployment."
