'use strict';

var adjectives = {
	list: ['design', 'develop', 'visualize'],
	// (precomputed) - number of characters in longest adjective
	width: 9 - 1,
	updateRate: 625,
	element: false,
	index: 0,
	start: function () {
		if (adjectives.element) {
			adjectives.element.classList.add('changing');
			adjectives.element.dataset.next = adjectives.list[++adjectives.index % adjectives.list.length];
			setTimeout(adjectives.finish, adjectives.updateRate);
		}
	},
	finish: function () {
		if (adjectives.element) {
			adjectives.element.textContent = adjectives.element.dataset.next;
			adjectives.element.classList.remove('changing');
			setTimeout(adjectives.start, adjectives.updateRate * 4);
		}
	},
	timeout: false
}


window.onRendered(function initializeAdjectives() {
	clearTimeout(adjectives.timeout);
	adjectives.element = document.getElementById('adjectives');
	if (adjectives.element) {
		adjectives.element.style.width = adjectives.width + 'ch';
		adjectives.timeout = setTimeout(adjectives.start, adjectives.updateRate);
	}
});
