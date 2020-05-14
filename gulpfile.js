// @ts-check
const {task, src, dest, parallel, series, watch} = require('gulp');

task('css', () => {
	const postcss = require('gulp-postcss');

	return src('./src/assets/css/*.css')
		.pipe(postcss([
			require('tailwindcss'),
			require('autoprefixer')
		]))
		.pipe(dest('dist/css'));
});

task('html', () => {
	return src('./src/**/*.html')
		.pipe(dest('./dist'));
});

task('html:minify', () => {
	const minify = require('gulp-htmlmin');
	return src('./dist/*.html')
		.pipe(minify({
			keepClosingSlash: true,
			collapseWhitespace: true
		}))
		.pipe(dest('./dist'));
});

task('css:minify', () => {
	const purgecss = require('gulp-purgecss');
	const minify = require('gulp-cssnano');

	return src('./dist/css/*.css')
		// @ts-ignore the typings are wrong :(
		.pipe(purgecss({
			content: ['./dist/**/*.html']
		}))
		.pipe(minify())
		.pipe(dest('./dist/css'));
});

task('default', parallel(['css', 'html']));

task('dev', series('default', function devServer() {
	const liveReload = require('browser-sync');
	watch('./src/**/*.css', series('css')).on('change', liveReload.reload);
	watch('./src/**/*.html', series('html')).on('change', liveReload.reload);

	liveReload.init({
		server: {
			baseDir: './dist/',
			directory: true,
		}
	})
}));

task('build', series(
	'default',
	parallel('css:minify', 'html:minify')
));
