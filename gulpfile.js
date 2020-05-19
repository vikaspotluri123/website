// @ts-check
const {task, src, dest, parallel, series, watch} = require('gulp');
let eleventy;

task('css', () => {
	const postcss = require('gulp-postcss');

	return src('./src/assets/css/*.css')
		.pipe(postcss([
			require('postcss-import'),
			require('tailwindcss'),
			require('autoprefixer')
		]))
		.pipe(dest('dist/css'));
});

task('html', async () => {
	if (!eleventy) {
		const Eleventy = require('@11ty/eleventy');
		eleventy = new Eleventy('./src', './dist');
		await eleventy.init();
	}

	await eleventy.write();
	eleventy.writer.writeCount = 0;
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

task('html:inline', async callback => {
	const FILE_TO_LARGE = Symbol('file is too large');
	const INLINE_THRESHOLD = 20_000; // Don't inline anything over ~20k

	const fs = require('fs').promises;
	const replace = require('gulp-replace');
	const readdirp = require('readdirp');

	const assets = new Map();
	const promises = [];

	for await (const entry of readdirp(`dist/css`, {alwaysStat: true, depth: 2})) {
		const key = `css/${entry.path}`;
		if (entry.stats.size > INLINE_THRESHOLD) {
			assets.set(key, FILE_TO_LARGE);
		} else {
			promises.push(
				fs.readFile(`./dist/${key}`, 'utf-8').then(contents => {
					assets.set(key, contents);
				})
			)
		}
	}

	await Promise.all(promises);
	src('./dist/*.html')
		.pipe(replace(/<link[^>]+?href="(.*?)"[^>]+>/g, (tag, asset) => {
			if (tag.includes('rel') && !tag.includes('stylesheet')) {
				return asset;
			}

			const contents = assets.get(asset.replace(/^\//, ''));

			if (contents === undefined) {
				console.warn('Invalid asset referenced: %s', asset);
				return '';
			}

			if (contents === FILE_TO_LARGE) {
				console.warn('Not inlining %s because it is too large', asset);
				return '';
			}

			if (contents === '') {
				console.warn('Empty asset: %s', asset);
				return '';
			}

			return `<style>${contents}</style>`;
		}))
		.pipe(dest('./dist'))
		.on('end', () => callback());
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
	const reload = () => liveReload.reload();
	watch('./src/**/*.css', series('css')).on('change', reload);
	watch('./src/**/*.html', series('html')).on('change', reload);

	liveReload.init({
		server: {
			baseDir: './dist/',
			directory: true
		},
		watch: false,
		open: false,
		notify: false
	})
}));

task('build', series(
	'default',
	parallel('css:minify', 'html:minify'),
	'html:inline'
));
