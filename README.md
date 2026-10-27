# Eyo: Spirit of Lagos

Explore Lagos. Unite the community. Celebrate its spirit.

First playable solo browser prototype for https://adamuorisha.africandroid.world, hosted by the owner on Olamidepanel. This repository is the deployment source. No Sites hosting is required.

## Play locally
Run `python3 -m http.server 8080 --directory public` and open http://localhost:8080. No dependencies, accounts, or build step.

## Implemented
Responsive illustrated 2D map, six locations, fictional volunteer dialogue, preparation and etiquette choices, decoration palette choice, four-beat timing challenge with keyboard/touch input, optional synthesized percussion, 20 Heritage Stars per completed task, Unity meter, gated finale, six journal cards, device-local progress, volunteer settings, reduced motion, reset.

## Scope
This is a 2D solo prototype. It does not yet provide a 3D world, online private rooms, computer companions, real recorded percussion, Yoruba audio/translation, accounts, server saves, or competitive awards. No claim of official festival endorsement is made. Cultural notes derive from the owner-supplied project brief and require custodian review before being presented as verified history. The guide and missions are fictional; sacred rites are outside gameplay.

## Olamidepanel deployment
1. Add adamuorisha.africandroid.world in the existing panel and obtain its actual document root.
2. Point the domain's DNS to the intended server and enable HTTPS using the panel.
3. Install Ansible on your control machine. Copy deploy/inventory.example.ini to your own inventory outside the repository and replace the host and document root.
4. Run `ansible-playbook -i /path/to/inventory.ini deploy/playbook.yml --syntax-check`.
5. Run `ansible-playbook -i /path/to/inventory.ini deploy/playbook.yml -e release_ref=COMMIT_SHA`.

The playbook pulls the source and copies only the three public game files, backing up replaced files. It preserves existing web server configuration; it does not create DNS, TLS, or panel sites. Review backups if rolling back. Pin release_ref to a reviewed commit for repeatable deployment. The main branch is allowed for development.

## Privacy
The prototype stores settings and game progress in localStorage on the player's device. It sends no game telemetry and contains no remote assets, third-party scripts, payments, or advertising. Hosting access logs remain under the operator's control. Reset progress clears task completion; browser site-data settings clear all stored settings.

## Cultural production roadmap
Commission custodian review, approved vocabulary and narration, musician recordings with permissions and attribution, then implement 3D exploration and authenticated private cooperative rooms with shared server-side task state. Fictional activities must remain identified separately from documented traditions.

## Deploy directly on the Olamidepanel server
As root on the server:
```bash
apt-get update
apt-get install -y ansible git python3
git clone https://github.com/olamidebello/adamuorisha.git /opt/eyo-deploy
cd /opt/eyo-deploy
bash deploy/deploy.sh /ACTUAL/DOCUMENT/ROOT
```
Replace /ACTUAL/DOCUMENT/ROOT with the domain's existing document root in Olamidepanel. Do not guess this path. If /opt/eyo-deploy already exists as this repository, run `git -C /opt/eyo-deploy pull --ff-only` instead of cloning again. Repeat the wrapper command to pull and deploy updates. An optional second argument selects a commit/tag instead of main.

The wrapper is for local execution on the target server; the inventory example remains available for remote Ansible. It validates the root, runs a syntax check, pulls source into /opt/eyo-spirit-source, validates all source assets, copies with timestamped backups, and reports the deployed commit. Existing site ownership and panel web-server configuration are preserved. Backups are beside replaced assets: move them to private storage after review so the web server does not expose old versions. Deployment does not prove public DNS/TLS or browser behavior; verify the public URL after running.
