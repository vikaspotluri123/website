const {series, watch, src, dest} = require('gulp');
const pump = require('pump');

// gulp plugins and utils
var livereload = require('gulp-livereload');
var zip = require('gulp-zip');
var beeper = require('beeper');

function serve(done) {
	livereload.listen();
	done();
}

const handleError = (done) => {
	return function (err) {
		if (err) {
			beeper();
		}
		return done(err);
	};
};

function hbs(done) {
	pump([
		src(['*.hbs', '**/**/*.hbs', '!node_modules/**/*.hbs']),
		livereload()
	], handleError(done));
}

function zipper(done) {
	var targetDir = 'dist/';
	var themeName = require('./package.json').name;
	var filename = themeName + '.zip';

	pump([
		src([
			'**',
			'!node_modules', '!node_modules/**',
			'!dist', '!dist/**'
		]),
		zip(filename),
		dest(targetDir)
	], handleError(done));
}

const hbsWatcher = () => watch(['*.hbs', '**/**/*.hbs', '!node_modules/**/*.hbs'], hbs);
const watcher = hbsWatcher;
const dev = series(serve, watcher);

exports.zip = series(zipper);
exports.default = dev;
