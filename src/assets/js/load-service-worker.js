'use strict';

if ('serviceWorker' in navigator) {
	window.addEventListener('load', function () {
		navigator.serviceWorker.register('./assets/js/sw.js');
	});
}
