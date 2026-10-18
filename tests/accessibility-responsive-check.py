#!/usr/bin/env python3
"""Static accessibility and responsive regression checks for the CartPole demo.

Checks markup and source invariants, not WCAG conformance or rendered layout.
Project author: Alysha Pursley.
"""
from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[2]
WEB = ROOT / "web-demo"
ISSUES: list[str] = []


class Page(HTMLParser):
    def __init__(self, source: Path):
        super().__init__(convert_charrefs=True)
        self.source = source
        self.headings: list[int] = []
        self.ids: set[str] = set()
        self.fragments: list[str] = []
        self.skip_link = False
        self.main = 0

    def handle_starttag(self, tag, attrs):
        data = dict(attrs)
        if tag == "main":
            self.main += 1
        if re.fullmatch(r"h[1-6]", tag):
            self.headings.append(int(tag[1]))
        if data.get("id"):
            self.ids.add(data["id"])
        if tag == "a":
            href = data.get("href", "")
            if href.startswith("#"):
                self.fragments.append(href[1:])
                if href == "#main-content":
                    self.skip_link = True
            elif not href.strip():
                ISSUES.append(f"{self.source.name}: empty link")
        if tag == "button" and not data.get("type"):
            ISSUES.append(f"{self.source.name}: button missing explicit type")
        if tag == "img" and "alt" not in data:
            ISSUES.append(f"{self.source.name}: image missing alt")
        if tag == "canvas" and not (data.get("aria-label") or data.get("aria-labelledby")):
            ISSUES.append(f"{self.source.name}: canvas lacks accessible name")
        if tag == "html" and not data.get("lang"):
            ISSUES.append(f"{self.source.name}: missing document language")

    def finish(self):
        if self.headings.count(1) != 1:
            ISSUES.append(f"{self.source.name}: expected one h1")
        if self.main != 1 or not self.skip_link or "main-content" not in self.ids:
            ISSUES.append(f"{self.source.name}: missing main/skip-link pairing")
        for fragment in self.fragments:
            if fragment not in self.ids:
                ISSUES.append(f"{self.source.name}: missing fragment #{fragment}")
        for earlier, later in zip(self.headings, self.headings[1:]):
            if later > earlier + 1:
                ISSUES.append(f"{self.source.name}: heading level jumps h{earlier} to h{later}")


def main() -> int:
    pages = sorted((WEB / "pages").glob("*.html"))
    for path in pages:
        source = path.read_text(encoding="utf-8")
        parser = Page(path)
        parser.feed(source)
        parser.close()
        parser.finish()
        if not re.search(r'<meta[^>]+name="viewport"', source):
            ISSUES.append(f"{path.name}: missing viewport meta")
    styles = "\n".join(p.read_text(encoding="utf-8") for p in (WEB / "assets/css").rglob("*.css"))
    for required in (":focus-visible", "prefers-reduced-motion", "max-width: 680px"):
        if required not in styles:
            ISSUES.append(f"styles: missing {required}")
    header = (WEB / "assets/js/components/site-header.js").read_text(encoding="utf-8")
    for required in ('aria-expanded', 'aria-controls', 'event.key === "Escape"', "toggle.focus()"):
        if required not in header:
            ISSUES.append(f"mobile menu: missing {required}")
    app = (WEB / "assets/js/app.js").read_text(encoding="utf-8")
    if "target.closest(\"button, a, input, select, textarea, [contenteditable]\")" not in app:
        ISSUES.append("manual arrow shortcuts: missing focused-control guard")
    if ISSUES:
        for issue in ISSUES:
            print("FAIL:", issue, file=sys.stderr)
        return 1
    print(f"Accessibility source checks passed: {len(pages)} content pages, "
          "semantic/heading/skip-link checks, focus, motion, and menu keyboard guards.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
