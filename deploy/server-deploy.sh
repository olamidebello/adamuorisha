#!/usr/bin/env bash
# Run on the GAME server. The separate Apps Store server is not contacted.
set -euo pipefail
if [[ $# -gt 2 ]]; then
  echo "Usage: bash server-deploy.sh [auto|document-root] [git-ref]" >&2
  exit 2
fi
if [[ $EUID -ne 0 ]]; then
  echo "Run as root on the game's Olamidepanel server." >&2
  exit 1
fi
repository='https://github.com/olamidebello/adamuorisha.git'
checkout='/opt/eyo-deploy'
document_root="${1:-auto}"
release_ref="${2:-main}"
if ! command -v git >/dev/null || ! command -v ansible-playbook >/dev/null || ! command -v python3 >/dev/null; then
  command -v apt-get >/dev/null || { echo "Install git, ansible and python3 first." >&2; exit 1; }
  apt-get update
  apt-get install -y git ansible python3
fi
command -v flock >/dev/null || { echo "Install util-linux for deployment locking." >&2; exit 1; }
exec 9>/run/lock/eyo-deploy.lock
flock -n 9 || { echo "Another Eyo deployment is running." >&2; exit 1; }
if [[ -e "$checkout" ]]; then
  [[ -d "$checkout/.git" ]] || { echo "$checkout exists but is not a Git checkout." >&2; exit 1; }
  origin="$(git -C "$checkout" remote get-url origin)"
  [[ "$origin" == "$repository" || "$origin" == "${repository%.git}" ]] || { echo "Unexpected repository in $checkout; refusing to overwrite." >&2; exit 1; }
  [[ -z "$(git -C "$checkout" status --porcelain)" ]] || { echo "Local changes in $checkout. Commit or move them before deploying." >&2; exit 1; }
  [[ "$(git -C "$checkout" branch --show-current)" == main ]] || { echo "Expected main branch in $checkout." >&2; exit 1; }
  git -C "$checkout" pull --ff-only origin main
else
  git clone --branch main "$repository" "$checkout"
fi
bash "$checkout/deploy/deploy.sh" "$document_root" "$release_ref"
echo "Game deployment completed. The separate African Apps Store server was not modified."
