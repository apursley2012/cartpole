/*
  +----------------------------------------------------------------------------+
  | CartPole Balance Lab — brand.js                                            |
  | Purpose: Renders the shared brand component.                               |
  | Author: Alysha Pursley                                                     |
  | Copyright (c) 2026 Alysha Pursley.                                         |
  +----------------------------------------------------------------------------+
*/

import { pageHref } from "./paths.js";

/** Create the shared brand anchor and decorative mark.
 * @returns {HTMLAnchorElement} Brand link with its accessible name.
 */
export function createBrand() {
	const link = document.createElement("a");
	link.className = "brand";
	link.href = pageHref("index.html");

	const mark = document.createElement("span");
	mark.className = "brand-mark";
	mark.setAttribute("aria-hidden", "true");

	const icon = document.createElement("span");
	icon.className = "cartpole-icon";
	icon.append(
		document.createElement("i"),
		document.createElement("b"),
		document.createElement("em"),
	);
	mark.append(icon);

	const text = document.createElement("span");
	const eyebrow = document.createElement("small");
	eyebrow.textContent = "Interactive Reinforcement Learning";
	text.append(eyebrow, document.createTextNode("CartPole // Balance Lab"));

	link.append(mark, text);
	return link;
}
