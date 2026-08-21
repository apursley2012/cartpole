<!--
File: README.md
Document Title: CartPole Control Lab
Author: Alysha Pursley
Date: August 2026
-->

<div align="center">

<h1>CartPole Control Lab 🧠</h1>

<p><a href="https://github.com/apursley2012/cartpole/stargazers"><img src="https://img.shields.io/github/stars/apursley2012/cartpole?style=for-the-badge&amp;logo=github&amp;label=Stars" alt="Stars"></a> <a href="https://github.com/apursley2012/cartpole/forks"><img src="https://img.shields.io/github/forks/apursley2012/cartpole?style=for-the-badge&amp;logo=github&amp;label=Forks" alt="Forks"></a> <a href="https://github.com/apursley2012/cartpole/issues"><img src="https://img.shields.io/github/issues/apursley2012/cartpole?style=for-the-badge&amp;logo=github&amp;label=Issues" alt="Issues"></a> <a href="https://github.com/apursley2012/cartpole/commits"><img src="https://img.shields.io/github/last-commit/apursley2012/cartpole?style=for-the-badge&amp;logo=git&amp;label=Last%20Commit" alt="Last Commit"></a> <a href="https://github.com/apursley2012/cartpole"><img src="https://img.shields.io/github/repo-size/apursley2012/cartpole?style=for-the-badge&amp;logo=github&amp;label=Repo%20Size" alt="Repo Size"></a> <a href="https://github.com/apursley2012/cartpole"><img src="https://img.shields.io/github/languages/top/apursley2012/cartpole?style=for-the-badge&amp;label=Top%20Language" alt="Top Language"></a></p>

<p><a href="https://apursley2012.github.io/cartpole/"><img src="https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-222222?style=for-the-badge&amp;logo=githubpages&amp;logoColor=white" alt="Live Demo"></a> <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&amp;logo=python&amp;logoColor=white" alt="Python"> <img src="https://img.shields.io/badge/Jupyter-F37626?style=for-the-badge&amp;logo=jupyter&amp;logoColor=white" alt="Jupyter"> <img src="https://img.shields.io/badge/Keras-D00000?style=for-the-badge&amp;logo=keras&amp;logoColor=white" alt="Keras"> <img src="https://img.shields.io/badge/NumPy-013243?style=for-the-badge&amp;logo=numpy&amp;logoColor=white" alt="NumPy"> <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&amp;logo=javascript&amp;logoColor=black" alt="JavaScript"></p>

<p><strong>An interactive CartPole reinforcement-learning project that explains the agent loop, exposes experiment controls and results, and preserves the original learning source alongside a browser-friendly control lab.</strong></p>

<p><a href="https://apursley2012.github.io/cartpole/">Open the live project</a> · <a href="https://github.com/apursley2012/cartpole">View the repository</a> · <a href="https://github.com/apursley2012/cartpole/issues/new/choose">Report an issue or request an addition</a></p>

</div>

---

## Table of Contents 📖

*   [Project Overview 🔎](#project-overview)
    *   [Purpose 🎯](#purpose)
    *   [Design Style and Inspiration 🎨](#design-style-and-inspiration)
    *   [Main Color Palette 🌈](#main-color-palette)
    *   [Preview Screenshots 🖼️](#preview-screenshots)
*   [Key Features ✨](#key-features)
*   [Tech Stack 🛠️](#tech-stack)
*   [Live Demo 🚀](#live-demo)
*   [Installation 📦](#installation)
    *   [Local Use 💻](#local-use)
    *   [GitHub Pages Deployment 🌐](#github-pages-deployment)
*   [Usage 🧭](#usage)
*   [Project Structure 🗂️](#project-structure)
    *   [Pages Included 📄](#pages-included)
    *   [Core Files and Architecture 🧩](#core-files-and-architecture)
    *   [File and Folder Structure 🌳](#file-and-folder-structure)
*   [Reinforcement-Learning Model 🤖](#reinforcementlearning-model)
*   [Customization Guide 🎨](#customization-guide)
*   [Accessibility and Browser Compatibility ♿](#accessibility-and-browser-compatibility)
*   [Repository Relationship 🔗](#repository-relationship)
*   [Project Scope and Limitations 📌](#project-scope-and-limitations)
*   [Possible Future Enhancements 💡](#possible-future-enhancements)
*   [Contributing 🤝](#contributing)
    *   [Reporting Issues 🐛](#reporting-issues)
    *   [Requesting Additions 📝](#requesting-additions)
*   [License 📜](#license)
*   [Important Links 🔗](#important-links)
*   [Copyright ©️](#copyright)

---

<a id="project-overview"></a>

<details open>
<summary><strong>Project Overview 🔎</strong></summary>


## Project Overview 🔎

I developed **CartPole Control Lab** as an interactive CartPole reinforcement-learning project that explains the agent loop, exposes experiment controls and results, and preserves the original learning source alongside a browser-friendly control lab.

</details>

<a id="purpose"></a>

<details open>
<summary><strong>Purpose 🎯</strong></summary>


### Purpose 🎯

I built the CartPole Control Lab to make the reinforcement-learning process easier to inspect than it is inside a notebook cell. The project keeps the relationship between state, action, reward, exploration, replay memory, and score visible, while the browser interface provides a direct way to explore the problem and the recorded results. The original source remains part of the project so the educational browser layer does not replace the actual learning implementation.

</details>

<a id="design-style-and-inspiration"></a>

<details open>
<summary><strong>Design Style and Inspiration 🎨</strong></summary>


### Design Style and Inspiration 🎨

CartPole Control Lab is styled as an interactive experiment console. Dark navy creates the lab and simulation shell, cream and paper keep explanations readable, and coral, cyan, lime, yellow, violet, and blue divide controls, metrics, state information, and feedback. The bold treatment makes the experiment memorable, but it stays centered on the learning problem: balancing the pole, observing state changes, comparing control behavior, and connecting the simulation to reinforcement-learning concepts.

</details>

<a id="main-color-palette"></a>

<details open>
<summary><strong>Main Color Palette 🌈</strong></summary>


### Main Color Palette 🌈

I pulled the palette below directly from the current project stylesheet `assets/css/styles.css`.

| Hex | Color Name | Primary Use |
| --- | --- | --- |
| `#11172B` | Ink Navy | Primary text, borders, hard shadows, and structural outlines |
| `#171D36` | Night | Main experiment and control surfaces |
| `#202747` | Night Blue | Secondary dark panels and headers |
| `#F7F1DF` | Cream | Main page background |
| `#FFFDF6` | Paper | Cards, simulation canvas, and light control surfaces |
| `#FF5F57` | Coral | Primary controls and strong experiment accents |
| `#54D8E5` | Cyan | State, control, and simulation highlights |
| `#C9F45B` | Lime | Status, success, and high-visibility metrics |
| `#A78BFA` | Violet | Secondary metric and decorative accent |
| `#FFD65A` | Yellow | Controls and highlighted technical details |
| `#4E78FF` | Blue | Labels and supporting technical emphasis |
| `#687086` | Muted Slate | Secondary text |
| `#CFD3DE` | Line Gray | Borders and separators |

</details>

<a id="preview-screenshots"></a>

<details open>
<summary><strong>Preview Screenshots 🖼️</strong></summary>


### Preview Screenshots 🖼️

Click any preview image in the repository screenshot folder to open the full-size file.


#### 🖼️ Screenshot Gallery


The gallery uses paired, centered images when screenshots are present. Keep screenshots under `images/screenshots/` and use names such as `cartpole-screenshot-01.png`, `cartpole-screenshot-02.png`, and so on. I have not invented image filenames that were not verified in the current project source.

</details>

---

<a id="key-features"></a>

<details open>
<summary><strong>Key Features ✨</strong></summary>


## Key Features ✨

*   **Explain the CartPole state, action, and reward loop**
*   **Visualize or simulate the cart-and-pole control problem in the browser**
*   **Document Deep Q-Learning concepts and experience replay**
*   **Show experiment settings and training/result information**
*   **Include score/history material from the learning runs**
*   **Preserve original notebook/source files**
*   **Provide a case study and article-style explanation**
*   **Publish the explanatory interface through GitHub Pages**

</details>

---

<a id="tech-stack"></a>

<details open>
<summary><strong>Tech Stack 🛠️</strong></summary>


## Tech Stack 🛠️

*   **HTML**
*   **CSS**
*   **JavaScript**
*   **Python source**
*   **Jupyter Notebook**
*   **Reinforcement-learning / Deep Q-Learning source and experiment data**

</details>

---

<a id="live-demo"></a>

<details open>
<summary><strong>Live Demo 🚀</strong></summary>


## Live Demo 🚀

Open the published project here:

[https://apursley2012.github.io/cartpole/](https://apursley2012.github.io/cartpole/)

</details>

---

<a id="installation"></a>

<details open>
<summary><strong>Installation 📦</strong></summary>


## Installation 📦

</details>

<a id="local-use"></a>

<details open>
<summary><strong>Local Use 💻</strong></summary>


### Local Use 💻

1. Clone or download the repository.
2. Keep the existing folder structure intact so the page can still find its styles, scripts, data, and assets.
3. Open the root `index.html` for static projects, or follow the project-specific runtime instructions when a backend/source application is included.
4. Before I publish changes, I check the main workflow, navigation, saved browser data where it applies, and the responsive layout.

</details>

<a id="github-pages-deployment"></a>

<details open>
<summary><strong>GitHub Pages Deployment 🌐</strong></summary>


### GitHub Pages Deployment 🌐

For the static/public portion, keep `index.html` at the repository root, use relative asset paths, then enable **Settings → Pages → Deploy from a branch → main → / (root)**. Projects that include Python, Node, MongoDB, authentication, browser automation, or another server runtime still need an appropriate backend host for those server-dependent features.

</details>

---

<a id="usage"></a>

<details open>
<summary><strong>Usage 🧭</strong></summary>


## Usage 🧭

Start with the main page and follow the project’s primary workflow. The interface is intended to be usable without reading the source first, while the case studies, articles, documentation, and source folders provide the deeper implementation context. Where browser storage is used, saved information belongs to that browser/device unless the project explicitly includes a shared backend.

</details>

---

<a id="project-structure"></a>

<details open>
<summary><strong>Project Structure 🗂️</strong></summary>


## Project Structure 🗂️

</details>

<a id="pages-included"></a>

<details open>
<summary><strong>Pages Included 📄</strong></summary>


### Pages Included 📄

| Page / Area | Purpose |
| --- | --- |
| `index.html` | Interactive browser control lab |
| `case-study.html` | Detailed project case study |
| `article.html` | Plain-language reinforcement-learning article |
| `css/` | Interface styling |
| `js/` | Browser interaction and visualization logic |
| `data/` | Result or experiment data used by the public experience |
| `docs/` | Supporting documentation |
| `source/` | Original learning/notebook source |

</details>

<a id="core-files-and-architecture"></a>

<details open>
<summary><strong>Core Files and Architecture 🧩</strong></summary>


### Core Files and Architecture 🧩

The repository separates the public interface from supporting source and documentation where the project needs that distinction. The important rule is that **CartPole Control Lab should be documented as the project it is**, not as a generic theme or one-size-fits-all site. Files that implement the main workflow belong with the application, while case studies, articles, source history, data, or backend code are documented according to their real role.

</details>

<a id="file-and-folder-structure"></a>

<details open>
<summary><strong>File and Folder Structure 🌳</strong></summary>


### File and Folder Structure 🌳

```text
cartpole/
├── README.md
├── index.html
├── case-study.html
├── article.html
├── css/
├── js/
├── data/
├── docs/
└── source/
```

This tree highlights the major documented areas rather than inventing files that were not verified.

</details>

---

<a id="reinforcementlearning-model"></a>

<details open>
<summary><strong>Reinforcement-Learning Model 🤖</strong></summary>


## Reinforcement-Learning Model 🤖

CartPole is a control problem with a compact state but a continuous stream of decisions. The agent observes values describing the cart and pole, chooses an action, receives the next state and reward, and gradually updates its policy from experience. The project explains those pieces separately so “the AI learned it” is not used as a substitute for the actual loop.

The browser experience is for inspection and interaction. Any original Python training behavior, neural-network updates, replay memory, or recorded run data remains identified as source-side reinforcement-learning work rather than being silently replaced by a scripted animation.

</details>

---

<a id="customization-guide"></a>

<details open>
<summary><strong>Customization Guide 🎨</strong></summary>


## Customization Guide 🎨

The safest way to customize or extend **CartPole Control Lab** is to preserve its existing workflow first, then change one layer at a time. Update project content and data in the files that already own that information, keep visual changes inside the existing style system, and test every page that shares the changed component or data source. New features should solve a problem that belongs to this project instead of copying a feature from an unrelated application.

For visual changes, update the documented palette intentionally and re-check contrast, responsive spacing, screenshots, and any state colors that depend on the same variables. For data or logic changes, test both the normal path and empty/error/edge cases before publishing.

</details>

---

<a id="accessibility-and-browser-compatibility"></a>

<details open>
<summary><strong>Accessibility and Browser Compatibility ♿</strong></summary>


## Accessibility and Browser Compatibility ♿

The public interface should remain keyboard-navigable, readable at common mobile and desktop widths, and usable without relying on color alone to communicate state. Form controls should keep visible labels or accessible names, images should use meaningful `alt` text, focus indicators should remain visible, and decorative animation should respect reduced-motion preferences when motion is present. Browser compatibility should be checked in current Safari, Chrome, Firefox, and Edge where practical.

</details>

---

<a id="repository-relationship"></a>

<details open>
<summary><strong>Repository Relationship 🔗</strong></summary>


## Repository Relationship 🔗

**CartPole Control Lab** is documented as its own project. Supporting case studies, articles, source history, static presentation layers, or backend/runtime folders are parts of this repository only when they help explain or run this project. They should not be described as separate replacement projects.

Where this repository contains both a static GitHub Pages layer and source that requires another runtime, the two are related but not interchangeable: the static layer provides the public experience that can run in a browser, while the source/runtime layer preserves functionality that GitHub Pages cannot execute directly.

</details>

---

<a id="project-scope-and-limitations"></a>

<details open>
<summary><strong>Project Scope and Limitations 📌</strong></summary>


## Project Scope and Limitations 📌

This README separates what the published browser version can do from functionality that belongs to a backend, database, native application, notebook, or other runtime. Static hosting limitations are stated where they materially affect the project. The documentation should not imply that GitHub Pages is providing server-side authentication, Python execution, MongoDB access, SMS delivery, or another service it cannot actually run.

</details>

---

<a id="possible-future-enhancements"></a>

<details open>
<summary><strong>Possible Future Enhancements 💡</strong></summary>


## Possible Future Enhancements 💡

*   Add side-by-side comparison of different exploration settings
*   Add clearer run-to-run score visualizations
*   Allow reproducible experiment presets
*   Add automated checks for any browser simulation and data-loading logic

</details>

---

<a id="contributing"></a>

<details open>
<summary><strong>Contributing 🤝</strong></summary>


## Contributing 🤝

Contributions, bug reports, and practical improvement suggestions are welcome when they preserve the existing project direction and do not replace its identity with a generic redesign.

</details>

<a id="reporting-issues"></a>

<details open>
<summary><strong>Reporting Issues 🐛</strong></summary>


### Reporting Issues 🐛

When reporting a problem, include the page or workflow involved, what you expected, what actually happened, browser/device information when relevant, and a screenshot if the issue is visual.

</details>

<a id="requesting-additions"></a>

<details open>
<summary><strong>Requesting Additions 📝</strong></summary>


### Requesting Additions 📝

Feature requests should explain the user problem the addition would solve and how it fits the existing project. Project-specific improvements are preferred over adding features only because they are common in other applications.

</details>

---

<a id="license"></a>

<details open>
<summary><strong>License 📜</strong></summary>


## License 📜

No license terms are assumed here. If the repository includes a `LICENSE` file, that file controls reuse. If it does not, normal copyright applies and permission should not be inferred from the repository being public.

</details>

---

<a id="important-links"></a>

<details open>
<summary><strong>Important Links 🔗</strong></summary>


## Important Links 🔗

*   **Live Project:** [https://apursley2012.github.io/cartpole/](https://apursley2012.github.io/cartpole/)
*   **Repository:** [https://github.com/apursley2012/cartpole](https://github.com/apursley2012/cartpole)
*   **Issues / Requests:** [https://github.com/apursley2012/cartpole/issues/new/choose](https://github.com/apursley2012/cartpole/issues/new/choose)

</details>

---

<a id="copyright"></a>

<details open>
<summary><strong>Copyright ©️</strong></summary>


## Copyright ©️

© 2026 Alysha Pursley. Project documentation and original project materials are credited to their respective sources where applicable.


---

Made with care by Alysha Pursley.

</details>
