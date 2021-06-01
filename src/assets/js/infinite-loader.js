// @ts-check
/* global maxPages */

class InfiniteLoader {
	constructor() {
		/** @type {DocumentFragment} */
		this._nextDom = null;
		this._loader = document.getElementById('read-more-trigger');
		this._postList = document.querySelector('.gh-postfeed');
		this._subscribeToLoadMore();
		this.loadNextPage();
	}

	_subscribeToLoadMore() {
		this._loader?.addEventListener('click', () => {
			this.loadNextPage();
			for (const post of this._nextDom.querySelectorAll('.post')) {
				this._postList.appendChild(post);
			}
		});
	}

	loadNextPage() {
		return this._loadNextPage().catch(() => {
			this._loader.hidden = true;
			this._nextDom = null;
		});
	}

	async _loadNextPage() {
		const activeDom = this._nextDom || document;
		/** @type {HTMLLinkElement} */
		const next = activeDom.querySelector('link[rel="next"]');
		if (!next?.href) {
			throw new Error('does not contain link[rel="next"]')
		}

		const response = await fetch(next.href);
		if (response.status === 404) {
			throw new Error('got 404');
		}

		this._nextDom = document.createRange().createContextualFragment(await response.text());
		debugger;

		if (!this._nextDom.querySelector('.post')) {
			throw new Error('got page but it has no posts');
		}
	}
}

// @ts-expect-error
window.__components = {
	infiniteLoader: new InfiniteLoader()
};
