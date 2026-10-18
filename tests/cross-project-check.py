#!/usr/bin/env python3
"""Cross-project runtime-data, reference and source integrity checks.

Source-level evidence, not a substitute for real browser/device testing.
Project author: Alysha Pursley.
"""
from __future__ import annotations

import ast
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[2]
WEB = ROOT / "web-demo"
errors: list[str] = []

manifest = json.loads((WEB / "manifest.webmanifest").read_text(encoding="utf-8"))
for field in ("name", "short_name", "start_url", "display", "icons"):
    if not manifest.get(field):
        errors.append(f"manifest missing required value: {field}")
for entry in manifest.get("icons", []):
    source = entry.get("src", "")
    if not source or not (WEB / source).is_file():
        errors.append(f"manifest icon not found: {source!r}")
start = manifest.get("start_url", "")
if start.startswith("/") or not (WEB / start).is_file():
    errors.append(f"manifest start_url not subpath-safe or missing: {start!r}")

notebook = json.loads((ROOT.parent / "Original/cartpole.ipynb").read_text(encoding="utf-8"))
if notebook.get("nbformat") != 4:
    errors.append("original notebook does not declare notebook format 4")
for index, cell in enumerate(notebook.get("cells", [])):
    if cell.get("cell_type") == "code":
        source = cell.get("source", [])
        try:
            ast.parse("".join(source) if isinstance(source, list) else source)
        except SyntaxError as exc:
            errors.append(f"original notebook cell {index} has invalid Python syntax: {exc}")

# Case-folded paths collide on case-insensitive filesystems.
seen: dict[str, Path] = {}
for file in ROOT.rglob("*"):
    if not file.is_file():
        continue
    relative = file.relative_to(ROOT)
    key = relative.as_posix().casefold()
    if key in seen and seen[key] != relative:
        errors.append(f"case-insensitive filename collision: {seen[key]} and {relative}")
    seen[key] = relative

# Guard against fake interactive targets in authored page markup.
for file in [ROOT / "index.html", ROOT / "404.html", *sorted((WEB / "pages").glob("*.html"))]:
    markup = file.read_text(encoding="utf-8")
    if re.search(r"""href\s*=\s*["']\s*(?:#|javascript:void\(0\))\s*["']""", markup, re.I):
        errors.append(f"non-functional anchor in {file.relative_to(ROOT)}")
    if re.search(r"""(?:src|href)\s*=\s*["']\s*["']""", markup, re.I):
        errors.append(f"empty source or link in {file.relative_to(ROOT)}")

if errors:
    for error in errors:
        print("FAIL:", error)
    raise SystemExit(1)
print("Cross-project source checks passed: manifest, notebook code, path casing, and authored page targets.")
