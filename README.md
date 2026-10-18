# CartPole Web Demo

**Author:** Alysha Pursley

This folder contains the fully static browser demo. It is intentionally separate
from the maintained Python/Jupyter implementation in `../Original/`.

## Run the demo

No package manager, build step, backend, database, or environment variables are
required. Serve this folder with any static web server:

```bash
cd web-demo
python3 -m http.server 8000
```

## Maintainability structure

The demo uses native ES modules and CSS imports so reusable concepts have one
implementation without introducing a framework or build system.

```text
web-demo/
├── index.html                  # static-host redirect
├── 404.html                    # host-level error page
├── pages/                      # content and legal HTML pages
├── assets/
│   ├── css/
│   │   ├── shared.css
│   │   ├── tokens.css
│   │   ├── base.css
│   │   ├── components/         # header, navigation, cards, etc.
│   │   └── pages/              # page-specific styles
│   └── js/
│       ├── components/         # brand, navigation, shell, paths
│       ├── app.js
│       ├── cartpole-env.js
│       ├── config.js
│       ├── dqn-agent.js
│       └── replay-buffer.js
└── manifest.webmanifest
```

`site-shell.js` composes the shared header and footer modules; `brand.js`, `navigation.js`, `site-header.js`, and `site-footer.js` own their respective markup and behavior.
The HTML pages provide only shell mount points plus page-specific content.

Shared visual concepts are split by responsibility. `brand.css` owns CartPole
brand/illustration geometry, `header.css` and `navigation.css` own header and primary navigation presentation,
`footer.css` owns the footer, and `content.css` owns genuinely reusable content
patterns such as article cards, formula cards, article action groups, and code
presentation. `tokens.css` and `base.css` provide the shared foundation.

Page CSS is used only when a rule belongs to one page or one page-specific
feature. A component is not extracted merely because two selectors happen to
look alike; extraction is for the same conceptual structure or behavior reused
in multiple places.

## Same component, different page styling

Keep the component's structure and base rules in its shared component file, then
apply a page-level variant through a page class or modifier.

For example, the same conceptual card can keep one `.article-card` base while a
page changes only its accent:

```css
.article-card {
  background: var(--paper);
  border: 3px solid var(--ink);
}

.page-case-study .article-card {
  --card-accent: var(--coral);
}

.page-technical-article .article-card {
  --card-accent: var(--cyan);
}
```

For a reusable component with several intentional variants, prefer modifier
classes such as `.card--coral` or `.card--compact`. Do not copy the complete
component into multiple page stylesheets just to change color, spacing, or one
small visual detail.

## Original project

The Python/Jupyter source, dependencies, score logger, and required third-party
notices live only in `../Original/`. Public pages link to the maintained
notebook there. These links work when the **parent CartPole directory** is published or
served, so that both `web-demo/` and `Original/` are accessible.
Serving only `web-demo/` locally displays the interactive demo but cannot serve
files in its sibling `Original/` folder. To test notebook navigation
locally, run `python3 -m http.server 8000` from the parent CartPole directory and open
`http://localhost:8000/Updated/web-demo/`.

## Prelaunch hardening

The prelaunch review adds a branded 404 page, crawlable `robots.txt`, favicon and
manifest assets, social-preview metadata/artwork, skip links, a responsive mobile
navigation control, a no-JavaScript navigation fallback, a restrictive meta CSP,
privacy information, and an accessibility statement.

The repository-level `docs/prelaunch-checklist-audit.md` separates checks that
are verifiable in source from checks that require the final production domain,
hosting configuration, real devices/browsers, assistive technology, or field
performance data. Absolute canonical URLs and an XML sitemap are intentionally
not fabricated before the production origin is known.


## Componentized page architecture

The browser demo now follows the requested page/component separation explicitly:

- `pages/*.html` contains every actual content/legal page: Demo, Case Study, Articles, Development Record, Privacy, and Accessibility.
- Root `index.html` is only the static-host entry redirect to `pages/index.html`; it is not a duplicate content implementation.
- Root `404.html` is the one deliberate page-location exception because static hosts commonly require the custom error document at the site root.
- `assets/js/components/brand.js` owns reusable logo/brand markup.
- `assets/js/components/navigation.js` owns menu/navigation data and current-page state.
- `assets/js/components/site-header.js` owns the shared header and mobile-menu behavior.
- `assets/js/components/site-footer.js` owns the shared footer.
- `assets/js/components/paths.js` owns page-aware relative paths.
- `assets/js/components/site-shell.js` is only the small composition entry point.
- `assets/css/components/brand.css`, `header.css`, `navigation.css`, `footer.css`, `cards.css`, and `accessibility.css` give those reusable concepts focused style ownership.
- `assets/css/pages/*.css` remains reserved for genuinely page-specific presentation instead of duplicating shared components.

There is no tabs component because this project has no tabbed interface. A placeholder tabs file would violate the requirement to avoid abstractions that do not improve maintainability.
