#!/usr/bin/env python3
"""Read Nginx's active configuration; never guess or modify a panel root."""
import os
import re
import shutil
import subprocess
import sys

DOMAIN = "adamuorisha.africandroid.world"

def roots_from_config(config):
    config = re.sub(r"(?m)^\s*#.*$", "", config)
    tokens = re.findall(r'"[^"]*"|\x27[^\x27]*\x27|[^\s{};]+|[{};]', config)
    pos = 0
    def parse():
        nonlocal pos
        entries = []
        words = []
        while pos < len(tokens):
            token = tokens[pos]
            pos += 1
            if token == "}":
                return entries
            if token == "{":
                entries.append((words, parse()))
                words = []
            elif token == ";":
                entries.append((words, None))
                words = []
            else:
                words.append(token.strip("\x27\x22"))
        return entries
    roots = set()
    def walk(entries):
        for words, children in entries:
            if words == ["server"] and children is not None:
                names = [w[1:] for w, sub in children if sub is None and w and w[0] == "server_name"]
                if any(DOMAIN in n for n in names):
                    for w, sub in children:
                        if sub is None and len(w) == 2 and w[0] == "root" and "$" not in w[1]:
                            roots.add(os.path.realpath(w[1]))
            if children is not None:
                walk(children)
    walk(parse())
    return roots

def main():
    nginx = shutil.which("nginx") or "/usr/sbin/nginx"
    try:
        result = subprocess.run([nginx, "-T"], capture_output=True, text=True, timeout=30)
    except (OSError, subprocess.TimeoutExpired):
        sys.exit("Could not inspect Nginx. Pass the domain document root from Olamidepanel explicitly.")
    if result.returncode:
        sys.exit("Nginx configuration check failed. Run nginx -t to inspect it, or pass the verified panel root explicitly.")
    roots = roots_from_config(result.stdout)
    if len(roots) != 1:
        sys.exit("No single explicit Nginx root was found for " + DOMAIN + ". Pass the domain document root from Olamidepanel explicitly.")
    root = roots.pop()
    if not os.path.isdir(root):
        sys.exit("Configured root does not exist. Correct the domain setup in Olamidepanel first.")
    print(root)

if __name__ == "__main__":
    main()
