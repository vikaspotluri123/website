module.exports = {
	content: ['src/_data/_tailwind_prose_classes.html'],
	corePlugins: [],
	darkMode: 'class',
	theme: {
		screens: {
			lg: require('tailwindcss/defaultConfig').theme.screens.lg
		},
		extend: {
			colors: {
				...require('./tailwind.config.js').__colors,
				realGray: require('tailwindcss/colors').gray,
				gray: {
					200: 'var(--prose-divider)',
					300: 'var(--prose-marker)',
					500: 'var(--prose-caption)',
					600: 'var(--prose-leading)',
					700: 'var(--prose-primary-color)',
					800: 'var(--prose-preformatted)',
					900: 'var(--prose-emphasized)'
				}
			}
		}
	},
	plugins: [
		require('@tailwindcss/typography')({
			modifiers: ['lg']
		})
	]
}
