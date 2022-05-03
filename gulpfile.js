// @ts-check
const {task, src, dest, parallel, series, watch} = require('gulp');
const getWatcher = require('./gulp/watcher');
const promisifyStream = require('./gulp/promisify-stream');
/** @type {import('@11ty/eleventy')} */
let eleventy;

function copyChangedMarkupFile(path) {
	let destination = path.includes('blog') ? './dist-blog/' : './dist';
	return src(path).pipe(dest(destination));
}

task('clean', () => require('del')('./dist*'));

task('enableProdMode', () => {
	process.env.NODE_ENV = 'production';
	return Promise.resolve();
});

task('js', function () {
	const rollup = new Promise((resolve, reject) => {
		const {spawn} = require('child_process');

		const cp = spawn('yarn', ['rollup', '-c'], {stdio: 'inherit'});

		cp.on('exit', code => {
			code === 0 ? resolve(code) : reject(code);
		});
	});

	const built = promisifyStream(src('./src/assets/js/built/**/*.js').pipe(dest('./dist/js')))

	return Promise.all([built, rollup]);
});

task('css', () => {
	const postcss = require('gulp-postcss');
	const tailwindcss = require('tailwindcss');
	const globalPostcssPlugins = [
		require('autoprefixer'),
		...process.env.NODE_ENV === 'production' ? [require('cssnano')] : []
	];

	return Promise.all([
		promisifyStream(
			src('./src/assets/css/*.css')
				.pipe(postcss([
					require('postcss-import'),
					tailwindcss,
					...globalPostcssPlugins
				]))
				.pipe(dest('dist/css'))
		),

		promisifyStream(
			src('./src/assets/css/blog/prose.css')
				.pipe(postcss([
					// Provide a custom config that specifically targets the prose selector 🔥
					// @ts-expect-error
					tailwindcss(require('./tailwind-prose.config.js')),
					...globalPostcssPlugins
				]))
				.pipe(dest('dist/css'))
		)
	]);
});

task('markup', async () => {
	if (!eleventy) {
		const Eleventy = require('@11ty/eleventy');
		eleventy = new Eleventy('./src', './dist');
		await eleventy.init();
	}

	await Promise.all([
		eleventy.write(),
		src(['src/blog/**/*.hbs', '!src/blog/_members-data/**/*', 'src/blog/package.json']).pipe(dest('./dist-blog/')),
		src('src/blog/assets/**/*').pipe(dest('./dist-blog/assets'))
	]);
});

task('binaries', () => {
	return src(['./src/assets/font/**/*', './src/assets/img/**/*'], {base: './src/assets'})
		.pipe(dest('./dist'));
});

task('markup:minify', () => {
	const minify = require('./gulp/minify');
	return Promise.all([
		promisifyStream(src('./dist/*.html').pipe(minify).pipe(dest('./dist'))),
		promisifyStream(src('./blog-dist/**/*.hbs').pipe(minify).pipe(dest('./dist-blog')))
	]);
});

task('markup:inline', async () => {
	const {readAllAssets, inlineAssetGlob} = require('./gulp/asset-inliner');
	const assets = new Map();

	await Promise.all([
		readAllAssets('js', assets),
		readAllAssets('css', assets),
	]);

	return Promise.all([
		inlineAssetGlob('./dist/**/*.html', './dist', assets),
		inlineAssetGlob('./dist-blog/default.hbs', './dist-blog', assets),
		inlineAssetGlob('./dist-blog/partials/*.hbs', './dist-blog/partials/', assets)
	]);
});

// Markup depends on CSS and JS assets to be compiled since the assets are minified / have a hashed url
task('default', series(parallel(['css', 'binaries', 'js']), 'markup'));

task('dev', series(async () => {
	// @todo: see if this is needed in the next tailwind release
	process.env.TAILWIND_MODE = 'watch';
}, 'default', async function devServer() {
	const liveReload = getWatcher();
	// This function is async to signal gulp that the the task completed
	const reload = async () => liveReload.reload();
	watch('./src/**/*.css', series('css', reload));
	watch('./src/**/*.js', series('js', reload));
	watch(['./src/**/*.hbs', './src/**/*.md'], series('css')).on('change', copyChangedMarkupFile);
	watch(['./src/assets/font/**/*', './src/assets/img/**/*'], series('binaries', reload));
	eleventy.watch().then(() => eleventy.watcher.on('all', reload));
}));

task('build', series(
	'enableProdMode',
	'default',
	'markup:minify',
	'markup:inline'
));

task('blog:zip', () => {
	const zip = require('gulp-zip');

	return src('./dist-blog/**/*')
		.pipe(zip('vikas-potluri-theme.zip'))
		.pipe(dest('.'));
});
