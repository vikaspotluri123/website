module.exports = {
	purge: [
		'./dist-blog/**/*.hbs',
		'./dist/**/*.html'
	],
	theme: {
		container: {
			center: true
		},
		extend: {
			colors: {
				white: '#ebebeb',
				black: '#4F4F4F'
			}
		},
		typography(theme) {
			return {
				default: {
					css: {
						hr: {
							borderColor: theme('colors.black')
						}
					}
				}
			};
		}
	},
	future: {
		removeDeprecatedGapUtilities: true,
		purgeLayersByDefault: true
	},
	variants: {},
	plugins: [
		/* require('@tailwindcss/typography')({
			modifiers: ['lg']
		}) */
	],
}
