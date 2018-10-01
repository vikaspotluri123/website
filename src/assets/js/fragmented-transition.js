function buildFragmentedTransition() {
	var body = document.body;
	var listeners = [];
	var activeElement = document.querySelector('section.active');
	if (!activeElement) {
		console.warn('No active element found!');
	}

	window.fragmentedTransition = {
		clicked: function (event) {
			event.preventDefault();

			var id;
			var location;
			if (this.pageTransition) {
				id = this.href === '#' ? '#introduction' : this.href
			} else {
				id = this.getAttribute('href');
			}

			id = id.substr(1);
			location = id === 'introduction' ? '/' : id;

			var newActiveElement = document.getElementById(id);
			if (activeElement === newActiveElement) {
				return;
			}

			if (!newActiveElement) {
				console.warn('New active element not found:', id);
				return;
			}

			var bodyClass = `transitioning-to-${id}`;
			body.classList.add('transitioning');
			body.classList.add(bodyClass);
			setTimeout(() => {
				body.classList.add(`active-${id}`);
				body.classList.remove(`active-${activeElement.id}`);
				activeElement.classList.remove('active');
				newActiveElement.classList.add('active');
				window.history.pushState(location, '', location);
				listeners.forEach(listener => listener());
				activeElement = newActiveElement;
				body.classList.remove('transitioning');
				body.classList.remove(bodyClass);
			}, 500);
		},
		onPageChange: function (action) {
			listeners.push(action);
		},
		// @todo: update state on pushState and actually use it
		handlePopState: function (state) {
			var self = window.fragmentedTransition;
			var { href } = document.location;
			href = `#${href.replace(window.origin + '/', '')}`;
			self.clicked.call({ pageTransition: true, href }, new Event('POPSTATE'));
		}
	};

	Array.from(document.links).filter(link =>
		link.getAttribute('href').startsWith('#') && !link.classList.contains('no-listen')
	).forEach(link => {
		console.log('Adding Listener:', link.href);
		link.addEventListener('click', window.fragmentedTransition.clicked);
	});

	window.onpopstate = window.fragmentedTransition.handlePopState;
}

buildFragmentedTransition();
