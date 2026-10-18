/*
  +----------------------------------------------------------------------------+
  | CartPole Balance Lab — paths.js                                            |
  | Purpose: Resolves shared static-site navigation paths.                     |
  | Author: Alysha Pursley                                                     |
  | Copyright (c) 2026 Alysha Pursley.                                         |
  +----------------------------------------------------------------------------+
*/

/** Detect the /pages/ route because the root 404 uses a different link base.
 * @returns {boolean} Whether the current URL is a content-page route.
 */
export function isContentPage() {
	return window.location.pathname.split("/").includes("pages");
}

/** Identify the current HTML page for navigation highlighting.
 * @returns {string} Last pathname segment, defaulting to index.html.
 */
export function currentPage() {
	return window.location.pathname.split("/").pop() || "index.html";
}

/** Resolve navigation relative to the current route to support subpath hosting.
 * @param {string} filename - Content page filename.
 * @returns {string} Relative link to that content page.
 */
export function pageHref(filename) {
	return isContentPage() ? `./${filename}` : `./pages/${filename}`;
}

/** Reach the sibling Original notebook from either site route depth.
 * @returns {string} Relative link to the original Jupyter notebook.
 */
export function notebookHref() {
	return isContentPage()
		? "../../../Original/cartpole.ipynb"
		: "../../Original/cartpole.ipynb";
}
