// @ts-check
const switcher = document.getElementById('theme-switcher');

/** @param {boolean} makeDark */
const setTheme = makeDark => document.documentElement.classList.toggle('dark', makeDark);

/**
 * @param {MediaQueryListEvent} event
 */
const handleColorSchemePreferenceChange = (event) => {
	if (!localStorage.getItem('theme')) {
		setTheme(event.matches);
	}
}

const handleThemeChangeRequest = () => {
	const savedTheme = localStorage.getItem('theme');
	let nextTheme;
	let shouldUseDarkMode = false;

	if (savedTheme === 'light') {
		nextTheme === 'system';
		shouldUseDarkMode = systemThemeMatch.matches;
	} else if (savedTheme === 'dark') {
		nextTheme = 'light';
	} else {
		nextTheme = 'dark';
		shouldUseDarkMode = true;
	}

	if (nextTheme === 'system') {
		localStorage.removeItem('theme');
	} else {
		localStorage.setItem('theme', nextTheme);
	}

	setTheme(shouldUseDarkMode);
};

switcher.addEventListener('click', handleThemeChangeRequest);

/** @type {{systemThemeMatch: MediaQueryList}} */
// @ts-expect-error
const {systemThemeMatch} = window;

systemThemeMatch.addEventListener('change', handleColorSchemePreferenceChange);
