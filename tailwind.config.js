module.exports = {
	purge: [
		'./src/assets/blog/**/*.hbs',
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
  variants: {},
  plugins: [
		require('@tailwindcss/typography')({
			modifiers: ['lg']
		})
	],
}
