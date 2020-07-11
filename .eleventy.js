module.exports = eleventy => {
	eleventy.addHandlebarsHelper('meta', require('./eleventy/compute-seo'));
	eleventy.addHandlebarsHelper('block', require('./eleventy/block'));

	return {
		dir: {
			layouts: '_layouts'
		},
		templateFormats: ['hbs', 'html', 'md'],
		htmlTemplateEngine: 'hbs',
		markdownTemplateEngine: 'hbs'
	};
};
