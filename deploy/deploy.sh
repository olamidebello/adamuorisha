#!/usr/bin/env bash
set -euo pipefail
if [[ $# -gt 2 ]]; then
  echo "Usage: bash deploy/deploy.sh [auto|/actual/olamidepanel/domain/document-root] [git-ref]" >&2
  exit 2
fi
if [[ $EUID -ne 0 ]]; then
  echo "Run this script as root on the Olamidepanel server." >&2
  exit 1
fi
for dependency in ansible-playbook python3; do
  command -v "$dependency" >/dev/null || { echo "Missing $dependency. On Debian: apt-get update && apt-get install -y ansible git python3" >&2; exit 1; }
done
script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
document_root="${1:-auto}"
if [[ "$document_root" == auto ]]; then
  document_root="$(python3 "$script_dir/detect-root.py")"
  echo "Detected domain document root: $document_root"
fi
variables="$(mktemp)"
chmod 600 "$variables"
trap 'rm -f -- "$variables"' EXIT
python3 - "$document_root" "${2:-main}" > "$variables" <<'PY'
import json, os, sys
root=os.path.realpath(sys.argv[1])
if not os.path.isabs(sys.argv[1]) or not os.path.isdir(root) or root in ('/','/var/www','/var/www/html','/home','/opt') or len(root)<13:
    sys.exit('Choose the existing document root for adamuorisha.africandroid.world from Olamidepanel.')
json.dump({'panel_document_root':root,'release_ref':sys.argv[2]},sys.stdout)
PY
ansible-playbook -i 'localhost,' -c local "$script_dir/playbook.yml" --limit localhost -e "@$variables" --syntax-check
ansible-playbook -i 'localhost,' -c local "$script_dir/playbook.yml" --limit localhost -e "@$variables"
echo "Files deployed. Verify https://adamuorisha.africandroid.world/ in your browser."
