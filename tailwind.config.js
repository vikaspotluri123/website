const __colors = {
	white: '#ebebeb',
	black: '#4F4F4F'
};

module.exports = {
	__colors,
	purge: ['./src/**/*.hbs'],
	mode: 'jit',
	darkMode: 'class',
	theme: {
		container: {
			center: true
		},
		extend: {
			colors: __colors
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
	}
}
