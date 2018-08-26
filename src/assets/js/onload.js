'use strict';

// Scoped logger convenience method
window.createLogger = function (name) {
	name = '[' + name + ']:';
	return function log() {
		var args = Array.from(arguments);
		args.unshift(name);
		console.log.apply(console, args);
	};
}

var onloadLogger = createLogger('Rendered');

// Add support for reinitializing components after DOM change
window._onRendered = [];

window.onRendered = function(fn) {
	onloadLogger('Adding fn to list:', fn.name || '<anonymous>');
	window._onRendered.push(fn);
	if (document.attachEvent ? document.readyState === 'complete' : document.readyState !== 'loading') {
		fn();
	}
}

window.rendered = function executeFunctions() {
	console.log('----------');
	onloadLogger('(Re)initializing functions');
	for (var i = 0; i < window._onRendered.length; ++i) {
		window._onRendered[i]();
	}
};


if (!(document.attachEvent ? document.readyState === 'complete' : document.readyState !== 'loading')) {
	document.addEventListener('DOMContentLoaded', window.rendered);
}
