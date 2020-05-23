module.exports = eleventy => {
	eleventy.addHandlebarsHelper('meta', require('./eleventy/compute-seo'));

	return {
		dir: {
			layouts: '_layouts'
		},
		templateFormats: ['hbs', 'html']
	};
};
