// @ts-check
/**
 * This component is used to highlight the active element in a "table of contents".
 *
 * The primary use case is the secondary navigation on the home page when mobile. Since this is only visible on smaller
 * screens, there's a resize observer in place to add / remove the intersection observer when the secondary navigation
 * becomes visible / invisible.
 *
 */

export default class ActiveNav {
	/**
	 * @param {HTMLElement} navContainer
	 */
	constructor(navContainer, minimumThreshold = 0.15, maximumThreshold = 0.85) {
		if (!('ResizeObserver' in window && 'IntersectionObserver' in window)) {
			return;
		}

		this.handleIntersection = this.handleIntersection.bind(this);

		// Registering the resize observer will also register the intersection observer if applicable
		this._registerResizeObserver();

		this._THRESHOLDS = [minimumThreshold, maximumThreshold];

		this._element = navContainer;
		/** @type {Element[]} */
		this._regions = [];
		/** @type {HTMLAnchorElement[]} */
		this._links = [];
		/** @type {IntersectionObserver} */
		this._intersectionObserver = null;

		for (const link of navContainer.querySelectorAll('a')) {
			const href = link.getAttribute('href') || '';
			if (href.startsWith('#')) {
				this._regions.push(document.querySelector(href));
				this._links.push(link);
			}
		}
	}

	/**
	 * @param {boolean} value
	 */
	set enabled(value) {
		if (this._enabled && !value) {
			this._unregisterIntersectionObserver();
			this._enabled = false;
		}

		if (!this._enabled && value) {
			this._registerIntersectionObserver();
			this._enabled = true;
		}
	}

	/**
	 * @description Controls which element has the active class.
	 * Since links and regions are a 1:1 mapping, we can determine the referenced navigation link by finding the index
	 * of the target content element. From there, we can toggle the "active" class of the element if it meets the minimum
	 * threshold
	 * @param {IntersectionObserverEntry[]} intersectionEntry
	 */
	handleIntersection([intersectionEntry]) {
		this._links[this._regions.indexOf(intersectionEntry.target)]
			.classList
			.toggle('active', intersectionEntry.intersectionRatio > this._THRESHOLDS[0]);
	}

	_registerResizeObserver() {
		this._resize = new ResizeObserver(() => {
			this.enabled = this._element.offsetParent !== null;
		});

		this._resize.observe(document.body);
	}

	_registerIntersectionObserver() {
		this._intersectionObserver = new IntersectionObserver(this.handleIntersection, {threshold: this._THRESHOLDS});
		for (const element of this._regions) {
			this._intersectionObserver.observe(element);
		}
	}

	_unregisterIntersectionObserver() {
		this._intersectionObserver?.disconnect();
		this._intersectionObserver = null;
	}
}
