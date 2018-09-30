const gulp = require('gulp');
const htmlreplace = require('gulp-html-replace');
const htmlmin = require('gulp-htmlmin');
const {readFile, writeFile} = require('fs');
const {promisify} = require('util');

const read = promisify(readFile);
const write = promisify(writeFile);

const PAGES = ['index', 'motivation', 'experience', 'resume'];

function makePages() {
	return read('./build/index.html', 'utf8').then(index =>
		PAGES.reduce((files, page) => {files[page] = index; return files}, {})
	).then(files => {
		const promises = [];
		const pages = PAGES.map(page => ({
			exp: new RegExp(` ACTIVE_IF_${page.toUpperCase()}`, 'g'),
			page
		}));

		Object.keys(files).forEach(fileName => {
			let file = files[fileName];
			pages.forEach(({page, exp}) => {
				file = file.replace(exp, fileName === page ? ' active' : '');
			});

			file = file.replace('ACTIVE_PAGE', `active-${fileName.replace('index', 'introduction')}`);
			promises.push(write(`./build/${fileName}.html`, file));
		});

		return Promise.all(promises);
	}).then(() => null);
}

module.exports.dev = cb => {
	gulp.src('./src/*.html')
		.pipe(gulp.dest('./build'))
		.on('end', () => makePages().then(cb));
}
module.exports.prod = cb => {
const assets = Object.values(require('../build/rev-manifest.json'));

	const css = assets.filter(asset => asset.toLowerCase().endsWith('css'))
		.map(asset => `./assets/css/${asset}`);
	const jsAssets = assets.filter(asset => asset.toLowerCase().endsWith('js'))
		.map(asset => `./assets/js/${asset}`);

	const js = ['./assets/js/load-service-worker.js', ...jsAssets];

	gulp.src('./src/*.html')
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
		.pipe(gulp.dest('build'))
		.on('end', () => {
			makePages.then(cb);
		});
};
