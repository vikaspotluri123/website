const gulp = require('gulp');
const cachebust = require('gulp-rev');

const {rename: _rename} = require('fs');
const {promisify} = require('util');

const rename = promisify(_rename);

module.exports = () => gulp.src([
	'./build/assets/css/**/*.css',
	'./build/assets/js/**/*.js'
]).pipe(cachebust())
	.pipe(cachebust.manifest())
	.pipe(gulp.dest('build'))
	.on('end', () => {
		const assets = require('../build/rev-manifest.json');
		const root = './build/assets';
		return Promise.all(Object.keys(assets).map(asset => {
			const path = asset.split('.').pop().toLowerCase();
			const compiled = assets[asset];
			return rename(`${root}/${path}/${asset}`, `${root}/${path}/${compiled}`);
		}));
	});
