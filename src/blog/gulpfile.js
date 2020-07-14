const {series, watch, src} = require('gulp');
const pump = require('pump');

// gulp plugins and utils
var livereload = require('gulp-livereload');
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

const hbsWatcher = () => watch(['*.hbs', '**/**/*.hbs', '!node_modules/**/*.hbs'], hbs);
const watcher = hbsWatcher;
const dev = series(serve, watcher);

exports.default = dev;
