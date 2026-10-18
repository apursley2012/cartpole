#!/usr/bin/env python3
"""Check static-demo security boundaries and project-owned source hygiene.

This is a source-level regression check, not penetration testing, an HTTP
security-header audit, or a dependency-vulnerability scan.
Project author: Alysha Pursley.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
WEB = ROOT / "web-demo"
FAILURES: list[str] = []


def fail(source: Path, issue: str) -> None:
    FAILURES.append(f"{source.relative_to(ROOT)}: {issue}")


def main() -> int:
    html_pages = list(WEB.rglob("*.html"))
    js_files = list((WEB / "assets/js").rglob("*.js"))
    source_files = html_pages + js_files + list((ROOT.parent / "Original").rglob("*.py"))

    # These are known dangerous sinks for a static demo that has no HTML-input feature.
    # Keep the allowlist small; review intentional changes rather than silently
    # accepting new dynamic HTML or remote execution capabilities.
    js_sinks = (
        r"\b(?:innerHTML|outerHTML|insertAdjacentHTML|document\.write)\b",
        r"\beval\s*\(",
        r"\bnew\s+Function\s*\(",
        r"\b(?:localStorage|sessionStorage|indexedDB)\b",
        r"\bfetch\s*\(",
        r"\bXMLHttpRequest\b",
    )
    for file in js_files:
        code = file.read_text(encoding="utf-8")
        for pattern in js_sinks:
            if re.search(pattern, code):
                fail(file, f"review prohibited dynamic/external operation: {pattern}")

    for file in html_pages:
        html = file.read_text(encoding="utf-8")
        if re.search(r"\son[a-z]+\s*=", html, flags=re.IGNORECASE):
            fail(file, "inline event-handler attribute")
        if re.search(r"<script\b(?![^>]*\bsrc\s*=)", html, flags=re.IGNORECASE):
            fail(file, "inline script element")
        if re.search(r"""(?:href|src)\s*=\s*["']\s*javascript:""", html, re.IGNORECASE):
            fail(file, "javascript: URL")
        if file.name != "index.html" or file.parent != WEB:
            if 'http-equiv="Content-Security-Policy"' not in html:
                fail(file, "missing defense-in-depth CSP meta policy")
        if file.parent == WEB and file.name == "index.html":
            if 'url=./pages/index.html' not in html:
                fail(file, "entry redirect is no longer fixed and relative")

    # Check only high-confidence credential formats; absence of matches does
    # not establish that the repository contains no secrets.
    secret_patterns = {
        "private-key block": r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----",
        "GitHub token": r"gh[pousr]_[A-Za-z0-9_]{30,}",
        "AWS access key": r"\b(?:AKIA|ASIA)[A-Z0-9]{16}\b",
        "Google API key": r"\bAIza[0-9A-Za-z_-]{35}\b",
    }
    for file in source_files:
        content = file.read_text(encoding="utf-8")
        for name, pattern in secret_patterns.items():
            if re.search(pattern, content):
                fail(file, f"possible {name}")

    if FAILURES:
        for item in FAILURES:
            print("FAIL:", item, file=sys.stderr)
        return 1
    print(f"Security source checks passed: {len(js_files)} JavaScript modules, "
          f"{len(html_pages)} HTML files, {len(source_files)} source files.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
