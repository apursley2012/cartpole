/*
  +----------------------------------------------------------------------------+
  | CartPole Balance Lab — site-header.js                                      |
  | Purpose: Renders the shared site header.                                   |
  | Author: Alysha Pursley                                                     |
  | Copyright (c) 2026 Alysha Pursley.                                         |
  +----------------------------------------------------------------------------+
*/

import { createBrand } from "./brand.js";
import { createNavigation } from "./navigation.js";

/** Insert the shared header and attach mobile-navigation controls.
 * @returns {void}
 */
export function renderHeader() {
	const target = document.querySelector("[data-site-header]");
	if (!target) return;

	target.classList.add("site-header");

	const navigation = createNavigation();
	navigation.id = "primary-navigation";

	const toggle = document.createElement("button");
	toggle.className = "mobile-nav-toggle";
	toggle.type = "button";
	toggle.setAttribute("aria-controls", navigation.id);
	toggle.setAttribute("aria-expanded", "false");
	toggle.textContent = "Menu";

	toggle.addEventListener("click", () => {
		const isOpen = navigation.dataset.open === "true";
		navigation.dataset.open = String(!isOpen);
		toggle.setAttribute("aria-expanded", String(!isOpen));
		toggle.textContent = isOpen ? "Menu" : "Close";
	});

	/*
   * Escape closes the mobile menu and returns focus to its trigger.
   * Closing after a navigation choice avoids leaving an expanded menu state
   * if a client-side navigation mechanism is introduced later.
   */
	navigation.addEventListener("keydown", event => {
		if (event.key === "Escape" && navigation.dataset.open === "true") {
			navigation.dataset.open = "false";
			toggle.setAttribute("aria-expanded", "false");
			toggle.textContent = "Menu";
			toggle.focus();
		}
	});

	navigation.addEventListener("click", event => {
		if (event.target.closest("a") && navigation.dataset.open === "true") {
			navigation.dataset.open = "false";
			toggle.setAttribute("aria-expanded", "false");
			toggle.textContent = "Menu";
		}
	});

	target.replaceChildren(createBrand(), toggle, navigation);
}
