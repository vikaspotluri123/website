'use strict';

// Add support for reinitializing components after DOM change
window._onRendered = [];

window.onRendered = function(fn) {
	window._onRendered.push(fn);
	if (document.attachEvent ? document.readyState === 'complete' : document.readyState !== 'loading') {
		fn();
	}
}

window.rendered = function executeFunctions() {
	for (var i = 0; i < window._onRendered.length; ++i) {
		window._onRendered[i]();
	}
};


if (!(document.attachEvent ? document.readyState === 'complete' : document.readyState !== 'loading')) {
	document.addEventListener('DOMContentLoaded', window.rendered);
}
