const gulp = require('gulp');
const htmlreplace = require('gulp-html-replace');
const htmlmin = require('gulp-htmlmin');

module.exports.dev = () => gulp.src('./src/*.html').pipe(gulp.dest('./build'));
module.exports.prod = () => {
const assets = Object.values(require('../build/rev-manifest.json'));

	const css = assets.filter(asset => asset.toLowerCase().endsWith('css'))
		.map(asset => `./assets/css/${asset}`);
	const jsAssets = assets.filter(asset => asset.toLowerCase().endsWith('js'))
		.map(asset => `./assets/js/${asset}`);

	const js = ['./assets/js/load-service-worker.js', ...jsAssets];

	return gulp.src('./src/*.html')
		.pipe(htmlreplace({
			css: {
				src: css,
				tpl: '<link rel="stylesheet" href="%s" />'
			},
			js: {
				src: js,
				tpl: '<script src="%s" async defer></script>'
			}
		}))
		.pipe(htmlmin({
			collapseWhitespace: true,
			removeComments: true
		}))
		.pipe(gulp.dest('build'));
};
