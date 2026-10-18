#!/usr/bin/env python3
"""Source completeness, ownership and local-reference regression checks.

These checks cover objective source invariants; they cannot certify subjective
readability, visual equivalence, or live deployment.
Project author: Alysha Pursley.
"""
from __future__ import annotations

import ast
from collections import defaultdict
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[2]
WEB = ROOT / "web-demo"
PROBLEMS: list[str] = []
SOURCE_SUFFIXES = {".html", ".css", ".js", ".mjs", ".py", ".json", ".webmanifest", ".yml"}
OMISSIONS = re.compile(
    r"(?i)\b(?:rest unchanged|existing code here|implementation omitted|"
    r"insert code here|remaining code omitted|same as above|pseudocode only)\b"
)


class Markup(HTMLParser):
    def __init__(self, file: Path):
        super().__init__(convert_charrefs=True)
        self.file = file
        self.ids: set[str] = set()
        self.refs: list[tuple[str, str]] = []
        self.idrefs: list[tuple[str, str]] = []

    def handle_starttag(self, tag, attrs):
        data = dict(attrs)
        value = data.get("id")
        if value:
            if value in self.ids:
                PROBLEMS.append(f"{self.file}: duplicate id {value}")
            self.ids.add(value)
        for key in ("aria-labelledby", "aria-describedby", "aria-controls", "for"):
            if data.get(key):
                self.idrefs.extend((key, part) for part in data[key].split())
        for key in ("href", "src", "poster"):
            if data.get(key):
                self.refs.append((key, data[key]))

    def finish(self):
        for key, value in self.idrefs:
            # Dynamically created navigation IDs are intentionally not in HTML.
            if value not in self.ids and value != "primary-navigation":
                PROBLEMS.append(f"{self.file}: {key} references absent id {value}")


def main() -> int:
    files = [p for p in ROOT.rglob("*") if p.is_file() and p.suffix in SOURCE_SUFFIXES
             and "_site" not in p.parts]
    for file in files:
        content = file.read_text(encoding="utf-8")
        if not content.strip():
            PROBLEMS.append(f"{file}: empty source file")
        if file.suffix in (".js", ".mjs", ".css", ".html") and len(content.splitlines()) == 1 and len(content) > 300:
            PROBLEMS.append(f"{file}: suspicious one-line source")
        if file.suffix in (".js", ".mjs", ".css", ".html") and OMISSIONS.search(content):
            PROBLEMS.append(f"{file}: omitted-code placeholder")
        if file.suffix == ".py":
            try:
                ast.parse(content, filename=str(file))
            except SyntaxError as exc:
                PROBLEMS.append(f"{file}: {exc}")
        if file.suffix in (".json", ".webmanifest"):
            try:
                json.loads(content)
            except ValueError as exc:
                PROBLEMS.append(f"{file}: invalid JSON: {exc}")
        if file.suffix == ".html":
            page = Markup(file)
            page.feed(content)
            page.close()
            page.finish()
            for key, raw in page.refs:
                if raw.startswith("#"):
                    if raw[1:] and raw[1:] not in page.ids:
                        PROBLEMS.append(f"{file}: missing anchor {raw}")
                    continue
                if raw.startswith(("/", "https:", "http:", "mailto:", "data:", "javascript:")):
                    if raw.startswith("/"):
                        PROBLEMS.append(f"{file}: root-absolute path {raw}")
                    continue
                target = raw.split("#")[0].split("?")[0]
                if target and not (file.parent / target).resolve().exists():
                    PROBLEMS.append(f"{file}: broken {key}={raw}")
        if file.suffix == ".css":
            for ref in re.findall(r"""url\(\s*['"]?([^)'" ]+)""", content):
                if ref.startswith(("data:", "https:", "http:", "#")):
                    continue
                if not (file.parent / ref.split("?")[0]).resolve().exists():
                    PROBLEMS.append(f"{file}: broken CSS url({ref})")
    modules = list((WEB / "assets/js").rglob("*.js"))
    dependencies: dict[Path, set[Path]] = defaultdict(set)
    for file in modules:
        content = file.read_text(encoding="utf-8")
        for ref in re.findall(r"""(?:import|from)\s*["'](\.[^"']+)["']""", content):
            target = (file.parent / ref).resolve()
            if not target.is_file():
                PROBLEMS.append(f"{file}: missing import {ref}")
            dependencies[file].add(target)
    visiting: set[Path] = set()
    visited: set[Path] = set()

    def walk(file: Path):
        if file in visiting:
            PROBLEMS.append(f"circular module import at {file}")
            return
        if file in visited:
            return
        visiting.add(file)
        for target in dependencies[file]:
            if target in dependencies:
                walk(target)
        visiting.remove(file)
        visited.add(file)

    for file in modules:
        walk(file)
    if not (ROOT.parent / "Original/cartpole.py").is_file():
        PROBLEMS.append("original Python implementation missing")
    if not (ROOT.parent / "Original/cartpole.ipynb").is_file():
        PROBLEMS.append("original notebook missing")
    if PROBLEMS:
        for issue in PROBLEMS:
            print("FAIL:", issue, file=sys.stderr)
        return 1
    print(f"Source structure passed: {len(files)} readable/parseable source files, "
          f"{len(modules)} JavaScript modules, local HTML/CSS paths, ID references, import cycles.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
