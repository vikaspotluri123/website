// @ts-check
const {task, src, dest, parallel, series, watch} = require('gulp');
const getWatcher = require('./gulp/watcher');
const promisifyStream = require('./gulp/promisify-stream');
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
	const globalPostcssPlugins = [
		require('autoprefixer'),
		...process.env.NODE_ENV === 'production' ? [require('cssnano')] : []
	];

	return Promise.all([
		promisifyStream(
			src(['./src/assets/css/*.css', '!./src/assets/css/prose.css'])
				.pipe(postcss([
					require('postcss-import'),
					require('tailwindcss'),
					...globalPostcssPlugins
				]))
				.pipe(dest('dist/css'))
		),

		promisifyStream(
			src('./src/assets/css/prose.css')
				.pipe(postcss(globalPostcssPlugins))
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

	eleventy.writer.writeCount = 0;
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
		inlineAssetGlob('./dist/*.html', './dist', assets),
		inlineAssetGlob('./dist-blog/default.hbs', './dist-blog', assets)
	]);
});

task('default', series(parallel(['markup', 'binaries', 'js']), 'css'));

task('dev', series('default', function devServer() {
	const liveReload = getWatcher();
	const reload = () => liveReload.reload();
	watch('./src/**/*.css', series('css')).on('change', reload);
	watch('./src/**/*.js', series('js')).on('change', reload);
	watch(['./src/**/*.hbs', './src/**/*.md']).on('change', copyChangedMarkupFile).on('change', reload);
	watch(['./src/assets/font/**/*', './src/assets/img/**/*'], series('binaries')).on('change', reload);
}));

task('build', series(
	'enableProdMode',
	'default',
	'markup:minify',
	'markup:inline'
));

task('blog:zip', () => {
	const zip = require('gulp-zip');

	return src('./src/dist-blog/**/*')
		.pipe(zip('vikas-potluri-theme.zip'))
		.pipe(dest('.'));
});
