module.exports = require('gulp-htmlmin')({
	keepClosingSlash: true,
	collapseWhitespace: true,
	ignoreCustomFragments: [/<%[\s\S]*?%>/, /<\?[\s\S]*?\?>/, /{{.*?}}/]
});
