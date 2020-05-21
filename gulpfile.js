// @ts-check
const {task, src, dest, parallel, series, watch} = require('gulp');
let eleventy;

task('enableProdMode', () => {
	process.env.NODE_ENV = 'production';
	return Promise.resolve();
});

task('css', () => {
	const postcss = require('gulp-postcss');

	return src('./src/assets/css/*.css')
		.pipe(postcss([
			require('postcss-import'),
			require('tailwindcss'),
			require('autoprefixer'),
			... process.env.NODE_ENV === 'production' ? [require('cssnano')] : []
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

task('binaries', () => {
	return src(['./src/assets/font/**/*', './src/assets/img/**/*'], {base: './src/assets'})
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
				return tag;
			}

			const contents = assets.get(asset.replace(/^\//, ''));

			if (contents === undefined) {
				console.warn('Invalid asset referenced: %s', asset);
				return '';
			}

			if (contents === FILE_TO_LARGE) {
				console.warn('Not inlining %s because it is too large', asset);
				return tag;
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

task('default', series(parallel(['html', 'binaries']), 'css'));

task('dev', series('default', function devServer() {
	const liveReload = require('browser-sync');
	const reload = () => liveReload.reload();
	watch('./src/**/*.css', series('css')).on('change', reload);
	watch('./src/**/*.hbs', series('html')).on('change', reload);
	watch(['./src/assets/font/**/*', './src/assets/img/**/*'], series('binaries')).on('change', reload);

	liveReload.init({
		server: {
			baseDir: './dist/'
		},
		watch: false,
		open: false,
		notify: false
	})
}));

task('build', series(
	'enableProdMode',
	'default',
	'html:minify',
	'html:inline'
));
