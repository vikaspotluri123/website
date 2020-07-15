// @ts-check
const {task, src, dest, parallel, series, watch} = require('gulp');
const promisifyStream = require('./gulp/promisify-stream');
let eleventy;


task('enableProdMode', () => {
	process.env.NODE_ENV = 'production';
	return Promise.resolve();
});

task('js', () => new Promise((resolve, reject) => {
	const {spawn} = require('child_process');

	const cp = spawn('yarn', ['rollup', '-c'], {stdio: 'inherit'});

	cp.on('exit', code => {
		code === 0 ? resolve(code) : reject(code);
	});
}));

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

task('html:inline', async () => {
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

task('default', series(parallel(['html', 'binaries', 'js']), 'css'));

task('dev', series('default', function devServer() {
	const liveReload = require('browser-sync');
	const reload = () => liveReload.reload();
	watch('./src/**/*.css', series('css')).on('change', reload);
	watch('./src/**/*.js', series('js')).on('change', reload);
	watch(['./src/**/*.hbs', './src/**/*.md'], series('html')).on('change', reload);
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

task('blog:build', async () => {
	const replace = require('gulp-replace');

	return Promise.all([
		promisifyStream(
			src([
				'src/blog/**/*.hbs',
				'!src/blog/_members-data/**/*',
				'!src/blog/default.hbs'
			]).pipe(
				dest('dist-blog')
			)
		),

		promisifyStream(
			src('src/blog/default.hbs').pipe(
				process.env.NODE_ENV === 'production' ? replace('<!-- live_reload -->', '') : replace('<!-- live_reload -->', '')
			).pipe(dest('dist-blog'))
		)
	])
});

task('blog:zip', () => {
	const zip = require('gulp-zip');

	return src('./src/blog/**/*')
		.pipe(zip('vikas-potluri-theme.zip'))
		.pipe(dest('.'));
});
