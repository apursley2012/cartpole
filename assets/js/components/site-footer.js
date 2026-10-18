/*
  +----------------------------------------------------------------------------+
  | CartPole Balance Lab — site-footer.js                                      |
  | Purpose: Renders the shared site footer.                                   |
  | Author: Alysha Pursley                                                     |
  | Copyright (c) 2026 Alysha Pursley.                                         |
  +----------------------------------------------------------------------------+
*/

import { pageHref } from "./paths.js";

/** Insert the shared footer into its existing page target.
 * @returns {void}
 */
export function renderFooter() {
	const target = document.querySelector("[data-site-footer]");
	if (!target) return;

	target.classList.add("site-footer");

	const summary = document.createElement("div");
	const title = document.createElement("strong");
	title.textContent = "CartPole // Balance Lab";
	const description = document.createElement("p");
	description.textContent =
		"An interactive reinforcement-learning experience built from my " +
		"CartPole-v1 Deep Q-Learning implementation.";
	summary.append(title, description);

	const links = document.createElement("div");
	links.className = "footer-links";

	[
		["Live Demo", "index.html"],
		["Case Study", "case-study.html"],
		["Article", "article.html"],
		["Development Record", "project-record.html"],
		["Privacy", "privacy.html"],
		["Accessibility", "accessibility.html"],
	].forEach(([label, filename]) => {
		const link = document.createElement("a");
		link.href = pageHref(filename);
		link.textContent = label;
		links.append(link);
	});

	const copyright = document.createElement("p");
	const year = document.createElement("span");
	year.dataset.currentYear = "";
	year.textContent = String(new Date().getFullYear());
	copyright.append(
		"© ",
		year,
		" Alysha Pursley. Project-authored portions are all rights reserved.",
	);

	target.replaceChildren(summary, links, copyright);
}
