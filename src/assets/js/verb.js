const verbs = {
	list: ['design', 'develop', 'visualize'],
	// (precomputed) - number of characters in longest adjective
	width: 9 - 1,
	updateRate: 625,
	element: false,
	index: 0,
	initialize: function initializeAdjectives() {
		clearTimeout(verbs.timeout);
		verbs.timeout = false;
		if (verbs.index > 250) {
			verbs.index %= verbs.list.length;
		}

		verbs.element.style.width = verbs.width + 'ch';
		verbs.timeout = setTimeout(verbs.start, verbs.updateRate);
	},
	start: function () {
		verbs.element.classList.add('changing');
		verbs.element.dataset.next = verbs.list[++verbs.index % verbs.list.length];
		verbs.timeout = setTimeout(verbs.finish, verbs.updateRate);
	},
	finish: function () {
		verbs.element.textContent = verbs.element.dataset.next;
		verbs.element.classList.remove('changing');
		verbs.timeout = setTimeout(verbs.start, verbs.updateRate * 4);
	},
	timeout: false
}

verbs.element = document.getElementById('verb');

verbs.initialize();
if (window.fragmentedTransition) {
	window.fragmentedTransition.onPageChange(verbs.initialize);
}
