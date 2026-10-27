# Eyo: Spirit of Lagos

Many Stories. One Lagos Spirit.

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

The playbook pulls the source and copies the game files and brand assets, backing up replaced files. It preserves existing web server configuration; it does not create DNS, TLS, or panel sites. Review backups if rolling back. Pin release_ref to a reviewed commit for repeatable deployment. The main branch is allowed for development.

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

## Visual identity
Slogan: **Many Stories. One Lagos Spirit.**

The original SVG emblem combines a white broad-brimmed hat, flowing cloth, and lagoon waves in a gold ring. Palette: lagoon green #153c35, warm gold #b78642, ivory #faf5e9. The header and favicon use public/assets/eyo-mark.svg. Two AI-generated illustrations appear in the hero and community sections. Artwork is imaginative, not documentary. This identity is custom-created for this project; no trademark clearance is implied.

Image prompts used with the built-in image generator: (1) warm stylized 3D Lagos Island procession, dignified white-robed Eyo figures, upright ceremonial staffs, volunteers, lagoon, ivory/gold/green, no text or sacred rites; (2) stylized 3D community volunteers painting fabric banners and preparing garlands in a sunny Lagos-inspired courtyard, matching palette, no text or sacred rites.

## Automatic path detection and ports
On the Olamidepanel server, update this checkout and run:
```bash
git -C /opt/eyo-deploy pull --ff-only
bash /opt/eyo-deploy/deploy/deploy.sh
```
With no path argument the launcher inspects the active Nginx configuration for an exact adamuorisha.africandroid.world server_name and a single explicit existing root. It stops on missing, ambiguous, inherited, included-only, variable-based, or proxy-only roots; supply the verified panel document root explicitly in those cases. It never guesses a path.

This game is static: it uses the domain's existing HTTP/HTTPS service, normally ports 80/443. No Node port, reverse-proxy process, firewall rule, or service restart is introduced. The launcher cannot guarantee that unrelated DNS, TLS, routing, firewall, or panel configuration issues are fixed. Verify the public URL after deployment.

## One-command game-server pull and deploy
Run the following as root on the Olamidepanel **game server**:
```bash
bash /opt/eyo-deploy/deploy/server-deploy.sh
```
For the first use of this launcher, update the existing checkout with `git -C /opt/eyo-deploy pull --ff-only`. If there is no checkout, first install Git and clone this repository to /opt/eyo-deploy.

The launcher installs missing Debian dependencies, takes a deployment lock, verifies the checkout's remote and branch, refuses local modifications, pulls main without rewriting history, then runs Ansible with automatic document-root discovery. Pass a verified root as argument one if discovery cannot identify it; argument two optionally pins game assets to a commit/tag. The deployment tooling is updated from main. Each deployment is invoked explicitly; no timer or recurring deployment is installed.

The African Apps Store is hosted on a separate server. This game deployment does not access, deploy, or register a listing on that server. Existing HTTP/HTTPS routing is reused; no additional application port is opened.

## Player language selection
Nigerian Pidgin (pcm) is the default for players without a saved language preference. The header selector also offers English (en), Yorùbá (yo), and Français (fr). The choice is saved separately from game progress as eyo-language-v1 in browser localStorage. No browser-location inference overrides this default.

The 105-entry text catalog in public/i18n.js covers the interface, quests, answers, story cards, map labels, rhythm prompts, settings, accessibility descriptions, and feedback. English is the source and fallback. Proper names and the game title are retained. These are draft text translations; Yoruba is general Yoruba, not a claim of an authenticated Lagos dialect, and there is no translated audio. Native-speaker editorial review remains recommended.

Switching languages refreshes the current location and restarts any active rhythm exercise without clearing completed tasks or stars. Existing players without a language preference receive Pidgin while retaining progress. Run `node --test tests/languages.test.cjs` to verify defaults, saved preferences, quest coverage, interpolation and progress preservation.

Deploy the update on the game server:
```bash
git -C /opt/eyo-deploy pull --ff-only
bash /opt/eyo-deploy/deploy/server-deploy.sh /var/www/eyo-spirit/public
```
The ordinary deployment copies the translation file with the game assets and preserves the working HTTP/HTTPS configuration. Do not rerun bootstrap-http.yml for an already configured site. The separate Apps Store server is not contacted.

