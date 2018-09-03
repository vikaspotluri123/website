if ('serviceWorker' in navigator) {
	const log = window.createLogger('Fragmented Transition');
	window.fragmentedTransition = {
		clicked (event) {
			event.preventDefault();

			document.body.classList.add('transitioning');
			const start = Date.now();

			log(`Requesting ${this.href}`);
			return fetch(this.href)
				.then(response => {
					log(`Received response in ~${Date.now() - start}ms`);
					return response.text();
				})
				.then(response => {
					const _404 = `<h1>404</h1>\n<p>Page Not Found</p><p><a href="#" class="back-btn no-listen">Go back</a></p>`;
					if (!response) {
						return _404;
					}

					const tempEl = document.createElement('html');
					tempEl.innerHTML = response;
					const content = tempEl.querySelector('#content') || _404;
					const classes = content.classList || [];

					return {content: content.innerHTML || content, classes};
				}).catch((error) => {
					debugger;
					return `
					<h1>500</h1>
					<p>Internal Client Error</p>
				`;
				}).then(({content, classes}) => {
					setTimeout(() => {
						window.history.pushState(null, '', this.href);
						const element = document.getElementById('content');
						element.innerHTML = content;
						if (classes.length) {
							element.classList = classes;
						}
						window.rendered();
						document.body.classList.remove('transitioning');
					}, (start + 250) - Date.now());
					log('Request for', this.href, 'loaded and parsed in', Date.now() - start, 'ms');
				});
		},
		addListeners() {
			Array.from(document.links).filter(link =>
				(new URL(link.href)).origin === window.origin && !link.classList.contains('no-listen')
			).forEach(link => {
				log('Adding Listener:', link.href);
				link.addEventListener('click', window.fragmentedTransition.clicked);
			});
		},
		refreshListeners() {
			log('Refreshing listeners');
			Array.from(document.links).forEach(link => {
				link.removeEventListener('click', window.fragmentedTransition.clicked)
			});
			window.fragmentedTransition.addListeners();
		},
		handlePopState() {
			const { href } = document.location;
			const self = window.fragmentedTransition;
			self.clicked.call({ href }, new Event('POPSTATE'));
		}
	};

	window.onRendered(() => {
		window.fragmentedTransition.refreshListeners();
		Array.from(document.querySelectorAll('.back-btn')).forEach(node => {
			log('Adding back button click handler', node);
			node.addEventListener('click', (e) => {
				e.preventDefault();
				window.history.go(-1);
			});
		});
	});

	window.onpopstate = window.fragmentedTransition.handlePopState;
}

