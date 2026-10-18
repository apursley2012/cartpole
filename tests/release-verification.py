#!/usr/bin/env python3
"""Verify a fresh Pages artifact, its exact source parity, and local HTTP routes.

Uses only Python's standard library; does not require a public deployment.
Project author: Alysha Pursley.
"""
from __future__ import annotations

import functools
import hashlib
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import subprocess
import sys
import tempfile
import threading
from urllib.error import HTTPError
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parents[2]


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def check(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def run(command: list[str]) -> None:
    subprocess.run(command, cwd=ROOT, check=True)


def verify_artifact(destination: Path) -> int:
    run([sys.executable, "-S", "scripts/prepare-pages.py", "--output", str(destination)])
    run([sys.executable, "-S", "web-demo/tests/deployment-artifact-check.py", str(destination)])
    staged = sorted(p.relative_to(destination) for p in destination.rglob("*") if p.is_file())
    for relative in staged:
        source = (ROOT.parent / relative) if relative.parts[0] == "Original" else (ROOT / Path(*relative.parts[1:])) if relative.parts[0] == "Updated" else ROOT / relative
        if relative.as_posix() in ("index.html", "404.html"):
            continue  # Generated repository-root redirect, not authored source.
        check(source.is_file(), f"staged file has no matching source: {relative}")
        check(digest(source) == digest(destination / relative),
              f"stale or modified staged file: {relative}")
    check(len(staged) >= 30, "unexpectedly small deployment artifact")
    return len(staged)


def verify_http(destination: Path) -> int:
    class QuietHandler(SimpleHTTPRequestHandler):
        def log_message(self, format, *args):
            pass

    handler = functools.partial(QuietHandler, directory=str(destination))
    server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    base = f"http://127.0.0.1:{server.server_port}"
    routes = {
        "/": b"./Updated/web-demo/",
        "/Updated/web-demo/": b"./pages/index.html",
        "/Updated/web-demo/pages/index.html": b"CartPole",
        "/Updated/web-demo/pages/case-study.html": b"Case Study",
        "/Updated/web-demo/pages/article.html": b"article",
        "/Updated/web-demo/pages/project-record.html": b"Development",
        "/Updated/web-demo/pages/privacy.html": b"Privacy",
        "/Updated/web-demo/pages/accessibility.html": b"Accessibility",
        "/Updated/web-demo/pages/reinforce-a2c-cartpole.html": b"CartPole",
        "/Updated/web-demo/assets/js/app.js": b"CartPole",
        "/Updated/web-demo/assets/css/shared.css": b"import",
        "/Updated/web-demo/manifest.webmanifest": b"name",
        "/Original/cartpole.ipynb": b"cells",
    }
    try:
        for route, marker in routes.items():
            with urlopen(base + route, timeout=5) as response:
                body = response.read()
                check(response.status == 200, f"HTTP status not 200: {route}")
                check(marker.lower() in body.lower(), f"unexpected response body: {route}")
        for route in ("/Updated/docs/review-summary.md", "/Updated/web-demo/tests/behavior-preservation.mjs",
                      "/Original/requirements.txt", "/nonexistent-page.html"):
            try:
                with urlopen(base + route, timeout=5) as response:
                    raise AssertionError(f"unexpectedly public path: {route}, {response.status}")
            except HTTPError as error:
                check(error.code == 404, f"unexpected status {error.code}: {route}")
        return len(routes) + 4
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=5)


def verify_failure_detection(destination: Path) -> None:
    target = destination / "Updated/web-demo/assets/js/app.js"
    original = target.read_bytes()
    try:
        target.unlink()
        result = subprocess.run(
            [sys.executable, "-S", "web-demo/tests/deployment-artifact-check.py",
             str(destination)], cwd=ROOT, capture_output=True, text=True
        )
        check(result.returncode != 0, "artifact checker missed a deleted required asset")
    finally:
        target.write_bytes(original)


def main() -> int:
    with tempfile.TemporaryDirectory(prefix="cartpole-release-") as temp:
        destination = Path(temp) / "published"
        count = verify_artifact(destination)
        verify_failure_detection(destination)
        requests = verify_http(destination)
    print(f"Release verification passed: {count} byte-identical staged files, "
          f"{requests} HTTP checks, and a missing-asset negative test.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
