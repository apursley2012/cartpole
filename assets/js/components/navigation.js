/*
  +----------------------------------------------------------------------------+
  | CartPole Balance Lab — navigation.js                                       |
  | Purpose: Implements shared navigation and responsive menu behavior.        |
  | Author: Alysha Pursley                                                     |
  | Copyright (c) 2026 Alysha Pursley.                                         |
  +----------------------------------------------------------------------------+
*/

import { currentPage, notebookHref, pageHref } from "./paths.js";

const navigationItems = [
	{ label: "Demo", filename: "index.html", matches: ["index.html"] },
	{
		label: "Case Study",
		filename: "case-study.html",
		matches: ["case-study.html"],
	},
	{
		label: "Articles",
		filename: "article.html",
		matches: ["article.html", "reinforce-a2c-cartpole.html"],
	},
	{
		label: "Development Record",
		filename: "project-record.html",
		matches: ["project-record.html"],
	},
];

/** Build the shared page navigation with the active section indicated.
 * @returns {HTMLElement} Navigation container for the current page.
 */
export function createNavigation() {
	const nav = document.createElement("nav");
	nav.setAttribute("aria-label", "Primary navigation");
	const page = currentPage();

	navigationItems.forEach(({ label, filename, matches }) => {
		const link = document.createElement("a");
		link.href = pageHref(filename);
		link.textContent = label;
		if (matches.includes(page)) {
			link.setAttribute("aria-current", "page");
		}
		nav.append(link);
	});

	const notebook = document.createElement("a");
	notebook.className = "nav-source";
	notebook.href = notebookHref();
	notebook.textContent = "Open Notebook ↗";
	nav.append(notebook);

	return nav;
}
