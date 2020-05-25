// @ts-check
export default class Verb {
	constructor(element) {
		this.list = ['design', 'develop', 'visualize']
		// (precomputed) - number of characters in longest adjective
		this.width = 9 - 1;
		this.updateRate = 625;
		this.element = element;
		this._index = 0;
		this._timeout = null;
		this.start = this.start.bind(this);
		this.finish = this.finish.bind(this);
	}

	initialize() {
		clearTimeout(this._timeout);
		this._timeout = null;
		if (this._index > 250) {
			this._index %= this.list.length;
		}

		this.element.style.width = this.width + 'ch';
		this.timeout = setTimeout(this.start, this.updateRate);
	}

	start() {
		this.element.classList.add('changing');
		this.element.dataset.next = this.list[++this._index % this.list.length];
		this._timeout = setTimeout(this.finish, this.updateRate);
	}

	finish() {
		this.element.textContent = this.element.dataset.next;
		this.element.classList.remove('changing');
		this.timeout = setTimeout(this.start, this.updateRate * 4);
	}
}
