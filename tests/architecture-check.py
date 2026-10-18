#!/usr/bin/env python3
"""Check CartPole browser-demo structure and source references.

This standard-library test belongs with the static-demo tests because it checks
local pages, assets, module paths, and repository-subpath compatibility.
It does not substitute for deployed HTTP or browser rendering tests.

Project author: Alysha Pursley.
Run: python3 -S web-demo/tests/architecture-check.py
"""
from __future__ import annotations

import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[2]
WEB = ROOT / "web-demo"
ERRORS: list[str] = []
REFERENCED: set[Path] = set()


def check_file(source: Path, reference: str) -> None:
    reference = reference.strip()
    if not reference or reference.startswith(("#", "data:", "mailto:", "tel:", "//")):
        return
    parsed = urlsplit(reference)
    if parsed.scheme or parsed.netloc:
        return
    if not parsed.path:
        return
    if parsed.path.startswith("/"):
        ERRORS.append(f"{source.relative_to(ROOT)}: root-absolute path {reference!r} is unsafe for GitHub Pages subpaths")
        return
    target = (source.parent / unquote(parsed.path)).resolve()
    if not target.is_relative_to(ROOT):
        ERRORS.append(f"{source.relative_to(ROOT)}: reference escapes repository {reference!r}")
    elif not target.is_file():
        ERRORS.append(f"{source.relative_to(ROOT)}: missing {reference!r}")
    else:
        REFERENCED.add(target)


class PageParser(HTMLParser):
    def __init__(self, source: Path) -> None:
        super().__init__(convert_charrefs=True)
        self.source = source
        self.ids: set[str] = set()
        self.fragments: list[str] = []
        self.h1_count = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attributes = dict(attrs)
        if len(attributes) != len(attrs):
            ERRORS.append(f"{self.source.relative_to(ROOT)}: duplicate HTML attribute in <{tag}>")
        element_id = attributes.get("id")
        if element_id:
            if element_id in self.ids:
                ERRORS.append(f"{self.source.relative_to(ROOT)}: duplicate id {element_id!r}")
            self.ids.add(element_id)
        if tag == "h1":
            self.h1_count += 1
        for name in ("src", "href", "poster"):
            value = attributes.get(name)
            if not value:
                continue
            if name == "href" and value.startswith("#"):
                if len(value) > 1:
                    self.fragments.append(unquote(value[1:]))
            else:
                check_file(self.source, value)
        if tag == "img" and "alt" not in attributes:
            ERRORS.append(f"{self.source.relative_to(ROOT)}: image missing alt attribute")

    def finish(self) -> None:
        for fragment in self.fragments:
            if fragment not in self.ids:
                ERRORS.append(f"{self.source.relative_to(ROOT)}: unresolved fragment #{fragment}")
        if self.source.parent.name == "pages" and self.h1_count != 1:
            ERRORS.append(f"{self.source.relative_to(ROOT)}: expected one h1, found {self.h1_count}")


def main() -> int:
    required = [
        ROOT.parent / "Original/cartpole.py",
        ROOT.parent / "Original/cartpole.ipynb",
        ROOT.parent / "Original/requirements.txt",
        WEB / "pages/index.html",
        WEB / "404.html",
        WEB / "index.html",
        WEB / "assets/js/components/site-shell.js",
    ]
    for file in required:
        if not file.is_file():
            ERRORS.append(f"missing required file: {file.relative_to(ROOT)}")
    for file in WEB.rglob("*.html"):
        parser = PageParser(file)
        parser.feed(file.read_text(encoding="utf-8"))
        parser.close()
        parser.finish()
    for file in WEB.rglob("*.css"):
        source = file.read_text(encoding="utf-8")
        for path in re.findall(r'@import\s+(?:url\()?\s*"([^"]+)"', source):
            check_file(file, path)
        for path in re.findall(r'url\(\s*"?([^)"]+)"?\s*\)', source):
            check_file(file, path)
    for file in WEB.rglob("*.js"):
        source = file.read_text(encoding="utf-8")
        for path in re.findall(r'(?:import|export)\s+(?:[^;]*?\s+from\s+)?"([^"]+)"', source):
            if path.startswith("."):
                check_file(file, path)
    manifest = WEB / "manifest.webmanifest"
    data = json.loads(manifest.read_text(encoding="utf-8"))
    check_file(manifest, data["start_url"])
    for icon in data.get("icons", []):
        check_file(manifest, icon["src"])
    for file in (ROOT.parent / "Original").rglob("*.py"):
        import ast
        ast.parse(file.read_text(encoding="utf-8"), filename=str(file))
    if ERRORS:
        for issue in ERRORS:
            print("FAIL:", issue, file=sys.stderr)
        return 1
    print(f"Architecture checks passed: {len(list(WEB.rglob('*.html')))} HTML pages, "
          f"{len(REFERENCED)} unique local references, CSS imports, JS imports, manifest, Python syntax.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
