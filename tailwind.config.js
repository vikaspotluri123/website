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
  },
  variants: {},
  plugins: [
		require('@tailwindcss/typography')
	],
}
