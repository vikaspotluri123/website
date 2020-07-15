// @ts-check
const {task, src, dest, parallel, series, watch} = require('gulp');
let eleventy;


const FILE_TO_LARGE = Symbol('file is too large');
const INLINE_THRESHOLD = 20_000; // Don't inline anything over ~20k

function promisifyStream(stream) {
	return new Promise((resolve, reject) => {
		stream.on('finish', resolve).on('error', reject)
	});
}

async function readAllAssets(type, assets) {
	const readdirp = require('readdirp');
	const fs = require('fs').promises;

	const promises = [];

	for await (const entry of readdirp(`dist/${type}`, {alwaysStat: true, depth: 2})) {
		const key = `${type}/${entry.path}`;
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

	return Promise.all(promises);
}

function inlineAsset(fullMatch, fullAsset, tagName, knownAssets) {
	let asset = fullAsset.toLowerCase().match(/{{\s?asset/i) ?
		fullAsset.match(/'(?<path>.*?)'/).groups.path : fullAsset;

	if (!asset) {
		console.error('Failed parsing asset location: %s', asset);
		return fullMatch;
	}

	asset = asset.replace(/^\//, '');

	const contents = knownAssets.get(asset);
	if (contents === undefined) {
		console.warn('Invalid asset referenced: %s', asset);
		return '';
	}

	if (contents === FILE_TO_LARGE) {
		console.warn('Not inlining %s because it is too large', asset);
		return fullMatch;
	}

	if (contents === '') {
		console.warn('Empty asset: %s', asset);
		return '';
	}

	return `<${tagName}>${contents}</${tagName}>`;
};

/**
 * @param {string} inputGlob
 * @param {string} outputDir
 * @param {Map<string, string>} knownFiles
 */
function inlineAssetGlob(inputGlob, outputDir, knownFiles) {
	const replace = require('gulp-replace');
	return promisifyStream(
		src(inputGlob, {allowEmpty: true})
		// The first expression will capture styles, second scripts
		.pipe(replace(/<link[^>]+?href="(.*?)"[^>]+>/g, (tag, asset) => {
			if (tag.includes('rel') && !tag.includes('stylesheet')) {
				return tag;
			}

			return inlineAsset(tag, asset, 'style', knownFiles);
		}))
		.pipe(replace(/<script[^>]+?src="(.*?)"[^>]*><\/script>/g, (tag, asset) => {
			return inlineAsset(tag, asset, 'script', knownFiles);
		}))
		.pipe(dest(outputDir))
	);
}

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
