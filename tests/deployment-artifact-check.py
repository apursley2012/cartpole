#!/usr/bin/env python3
"""Check a staged Pages artifact for subpath-safe links and exposure.

Static file verification only; this does not prove a live Pages deployment.
Project author: Alysha Pursley.
"""
from __future__ import annotations

import argparse
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import re
import sys


class Refs(HTMLParser):
    def __init__(self):
        super().__init__()
        self.paths: list[str] = []

    def handle_starttag(self, tag, attrs):
        data = dict(attrs)
        for key in ("href", "src", "poster"):
            if data.get(key):
                self.paths.append(data[key])
        if tag == "meta" and data.get("http-equiv", "").lower() == "refresh":
            match = re.search(r"url\s*=\s*([^;]+)", data.get("content", ""), re.I)
            if match:
                self.paths.append(match.group(1).strip())


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("artifact", type=Path)
    args = parser.parse_args()
    root = args.artifact.resolve()
    problems: list[str] = []
    required = ("index.html", "404.html", ".nojekyll", "Updated/web-demo/pages/index.html",
                "Updated/web-demo/assets/js/app.js", "Original/cartpole.ipynb")
    for name in required:
        if not (root / name).is_file():
            problems.append(f"missing: {name}")
    for forbidden in ("docs", ".github", "Updated/web-demo/tests", "original-project/requirements.txt"):
        if (root / forbidden).exists():
            problems.append(f"unwanted public file or folder: {forbidden}")
    checked = 0
    for file in root.rglob("*.html"):
        refs = Refs()
        refs.feed(file.read_text(encoding="utf-8"))
        for value in refs.paths:
            parsed = urlsplit(value)
            if parsed.scheme or parsed.netloc or value.startswith("#") or value.startswith("mailto:"):
                continue
            if parsed.path.startswith("/"):
                problems.append(f"{file.relative_to(root)}: root-absolute path {value}")
                continue
            if not parsed.path:
                continue
            target = (file.parent / unquote(parsed.path)).resolve()
            if not target.is_relative_to(root):
                problems.append(f"{file.relative_to(root)}: escapes artifact {value}")
            elif not target.exists():
                problems.append(f"{file.relative_to(root)}: broken path {value}")
            checked += 1
    for file in root.rglob("*.js"):
        code = file.read_text(encoding="utf-8")
        for value in re.findall(r"""(?:import|from)\s*["'](\.[^"']+)["']""", code):
            target = (file.parent / value).resolve()
            if not target.is_file():
                problems.append(f"{file.relative_to(root)}: missing module {value}")
            checked += 1
    if problems:
        for issue in problems:
            print("FAIL:", issue, file=sys.stderr)
        return 1
    print(f"Deployment artifact passed: {len(list(root.rglob('*')))} entries, {checked} local references.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
