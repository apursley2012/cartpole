#!/usr/bin/env python3
"""Check actionable comment conventions without requiring comments on trivial code.

This source-only audit cannot judge whether every explanatory comment is accurate.\nProject author: Alysha Pursley.
"""
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[2]
WEB = ROOT / "web-demo"
FILES = [*WEB.rglob("*.js"), *WEB.rglob("*.css"),
         *(ROOT.parent / "Original").rglob("*.py")]
issues = []

for path in FILES:
    text = path.read_text(encoding="utf-8")
    if path.suffix in (".js", ".css"):
        # The boxed project header is an explicit formatting requirement.
        body = text.split("*/", 1)[1] if "*/" in text else text
        if re.search(r"(?m)^\\s*\\*\\s*[=-]{12,}\\s*$", body):
            issues.append(f"{path.name}: decorative separators inside source")
        if re.search(r"(?m)^\\s*//\\s*(?:TODO|FIXME):", body):
            issues.append(f"{path.name}: tracked debt marker needs review")
    if re.search(r"(?im)^\\s*(?://|#|\\*)\\s*(?:TODO|FIXME):", text):
        issues.append(f"{path.name}: unresolved marker requires owner or ticket")

contracts = {
    "components/paths.js": ("@param {string} filename", "@returns {string}"),
    "replay-buffer.js": ("@param {number} count", "@returns"),
    "cartpole-env.js": ("@param {0|1} action", "@returns"),
}
for relative, expected in contracts.items():
    text = (WEB / "assets/js" / relative).read_text(encoding="utf-8")
    for marker in expected:
        if marker not in text:
            issues.append(f"{relative}: missing API documentation {marker}")

if issues:
    for issue in issues:
        print("FAIL:", issue, file=sys.stderr)
    raise SystemExit(1)
print(f"Commenting source checks passed: {len(FILES)} JS/CSS/Python files.")
