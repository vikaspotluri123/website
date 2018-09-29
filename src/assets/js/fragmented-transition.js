if ('serviceWorker' in navigator) {
	const log = window.createLogger('Fragmented Transition');
	let activeElement = document.querySelector('section.active');
	if (!activeElement) {
		console.warn('No active element found!');
	}

	window.fragmentedTransition = {
		clicked(event) {
			event.preventDefault();

			let id;
			let location;
			if (this.pageTransition) {
				id = this.href === '#' ? '#introduction' : this.href
			} else {
				id = this.getAttribute('href');
			}

			id = id.substr(1);
			location = id === 'introduction' ? '/' : id;

			const newActiveElement = document.getElementById(id);
			if (activeElement === newActiveElement) {
				return;
			}

			if (!newActiveElement) {
				console.warn('New active element not found:', id);
				return;
			}

			document.body.classList.add('transitioning');
			setTimeout(() => {
				activeElement.classList.remove('active');
				newActiveElement.classList.add('active');
				window.history.pushState(location, '', location);
				document.body.classList.remove('transitioning');
				activeElement = newActiveElement;
			}, 400);

		},
		addListeners() {
			Array.from(document.links).filter(link =>
				link.getAttribute('href').startsWith('#') && !link.classList.contains('no-listen')
			).forEach(link => {
				log('Adding Listener:', link.href);
				link.addEventListener('click', window.fragmentedTransition.clicked);
			});
		},
		// @todo: update state on pushState and actually use it
		handlePopState({ state }) {
			const self = window.fragmentedTransition;
			let { href } = document.location;
			href = `#${href.replace(window.origin + '/', '')}`;
			self.clicked.call({ pageTransition: true, href }, new Event('POPSTATE'));
		}
	};

	window.fragmentedTransition.addListeners();
	window.onpopstate = window.fragmentedTransition.handlePopState;
}
