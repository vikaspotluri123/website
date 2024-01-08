// @ts-check
const switcher = document.getElementById('theme-switcher');

/**
 * @typedef {'system' | 'light' | 'dark'} Theme
 */

/** @param {Theme} currentTheme @returns {Theme} */
const nextTheme = currentTheme => {
	switch (currentTheme) {
		case 'dark':
			return 'light';
		case 'light':
			return 'system';
		default:
			return 'dark';
	}
};

/**
 * @param {Theme} activeIcon
 */
const updateButton = activeIcon => {
	for (const child of switcher.children) {
		child.classList.toggle('hidden', !child.classList.contains(activeIcon));
	}

	switcher.setAttribute('title', `Use "${nextTheme(activeIcon)}" theme - current is "${activeIcon}"`);
};

/**
 * @param {boolean} makeDark
 * @param {Theme} activeIcon
 */
const setTheme = (makeDark, activeIcon) => {
	document.documentElement.classList.toggle('dark', makeDark);
	updateButton(activeIcon);
}

/**
 * @param {MediaQueryListEvent} event
 */
const handleColorSchemePreferenceChange = (event) => {
	if (!localStorage.getItem('theme')) {
		setTheme(event.matches, event.matches ? 'dark' : 'light');
	}
}

const handleThemeChangeRequest = () => {
	// @ts-expect-error
	const computedNextTheme = nextTheme(localStorage.getItem('theme'));
	const shouldUseDarkMode = computedNextTheme === 'system' ? systemThemeMatch.matches : computedNextTheme === 'dark';
	setTheme(shouldUseDarkMode, computedNextTheme);

	if (computedNextTheme === 'system') {
		localStorage.removeItem('theme');
	} else {
		localStorage.setItem('theme', computedNextTheme);
	}
};

// @ts-expect-error
updateButton(localStorage.getItem('theme') ?? 'system');

switcher.addEventListener('click', handleThemeChangeRequest);

/** @type {{systemThemeMatch: MediaQueryList}} */
// @ts-expect-error
const {systemThemeMatch} = window;

systemThemeMatch.addEventListener('change', handleColorSchemePreferenceChange);
document.addEventListener('load', () => {
	// `anik` --> Animations ok - otherwise the initial rendering transitions from light to dark and creates an
	// unexpected flash.
	document.body.classList.add('anik')
});
