// @ts-check
/* global maxPages */

class InfiniteLoader {
	static NOT_A_DOM = Symbol('not a dom');

	constructor() {
		/** @type {DocumentFragment} */
		this._nextDom = document;
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
			this._loader.style.display = 'none';
			if (!this._nextDom[InfiniteLoader.NOT_A_DOM]) {
				this._nextDom = document.createRange().createContextualFragment('');
				this._nextDom[InfiniteLoader.NOT_A_DOM] = true;
			}
		});
	}

	async _loadNextPage() {
		const activeDom = this._nextDom;
		/** @type {HTMLLinkElement} */
		const next = activeDom.querySelector('link[rel="next"]');
		if (!next?.href) {
			throw new Error('does not contain link[rel="next"]');
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
