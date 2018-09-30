'use strict';

var adjectives = {
	list: ['design', 'develop', 'visualize'],
	// (precomputed) - number of characters in longest adjective
	width: 9 - 1,
	updateRate: 625,
	element: false,
	index: 0,
	initialize: function initializeAdjectives() {
		clearTimeout(adjectives.timeout);
		adjectives.timeout = false;
		if (adjectives.index > 250) {
			adjectives.index %= adjectives.list.length;
		}

		if (document.body.classList.contains('active-introduction')) {
			adjectives.element.style.width = adjectives.width + 'ch';
			adjectives.timeout = setTimeout(adjectives.start, adjectives.updateRate);
		}
	},
	start: function () {
		adjectives.element.classList.add('changing');
		adjectives.element.dataset.next = adjectives.list[++adjectives.index % adjectives.list.length];
		adjectives.timeout = setTimeout(adjectives.finish, adjectives.updateRate);
	},
	finish: function () {
		adjectives.element.textContent = adjectives.element.dataset.next;
		adjectives.element.classList.remove('changing');
		adjectives.timeout = setTimeout(adjectives.start, adjectives.updateRate * 4);
	},
	timeout: false
}

adjectives.element = document.getElementById('adjectives');

window.onRendered(window.adjectives.initialize);
if (window.fragmentedTransition) {
	window.fragmentedTransition.onPageChange(window.adjectives.initialize);
}
