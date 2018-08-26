const cacheName = 'v1';
const cacheFiles = [
/*     './',
    './index.html',
    './js/app.js',
    './css/reset.css',
    './css/style.css',
    'https://fonts.googleapis.com/css?family=Source+Sans+Pro:400,700,400italic,700italic' */
];

self.addEventListener('install', event => {
	console.log('[ServiceWorker] Installed');
	event.waitUntil(
		caches.open(cacheName).then(cache => {
			console.log('[ServiceWorker] Caching cacheFiles');
			return cache.addAll(cacheFiles);
		})
	);
});


self.addEventListener('activate', event => {
	console.log('[ServiceWorker] Activated');
	event.waitUntil(caches.keys().then(cacheNames => Promise.all(cacheNames.map(cache => {
		if (cache !== cacheName) {
			console.log('[ServiceWorker] Removing Cached Files from Cache - ', cache);
			return caches.delete(cache);
		}
	}))));
});


self.addEventListener('fetch', event => {
	const {url} = event.request;
	console.log('[ServiceWorker] Fetch', url);
	if (event.request.mode === 'navigate') {
		console.log('[ServiceWorker] using cache', url)
		event.respondWith(caches.match(event.request).then(cachedResponse => {
			if (cachedResponse) {
				console.log("[ServiceWorker] Found in Cache", url, cachedResponse);
				return response;
			}

			return fetch(url).then(liveResponse => {
				if (!liveResponse || url.indexOf('sw.js') > 0) {
					console.log("[ServiceWorker] No response from fetch / requesting self")
					return liveResponse;
				}

				const responseForCache = liveResponse.clone();
				event.waitUntil(() =>
					caches.open(cacheName).then(cache => {
						cache.put(event.request, responseForCache);
						console.log('[ServiceWorker] New Data Cached', url);
						return liveResponse;
					})
				)
			}).catch(err => {
				console.log('[ServiceWorker] Error Fetching & Caching New Data', err);
			});
		}));
	}
});
