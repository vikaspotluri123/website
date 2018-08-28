const gulp = require('gulp');
const merge = require('merge-stream');

const concat = require('gulp-concat');
const jsUgly = require('gulp-uglify-es').default;
const rmDebug = require('gulp-strip-debug');
const order = require('gulp-order');
const sourcemaps = require('gulp-sourcemaps');

const core = [
	'src/assets/js/**/*.js',
	'!src/assets/js/load-service-worker.js',
	'!src/assets/js/sw.js'
];
const loadSw = 'src/assets/js/load-service-worker.js';
const dest = 'build/assets/js';

module.exports.prod = function () {
	const loadSwStream = gulp.src(loadSw).pipe(jsUgly({ toplevel: true })).pipe(gulp.dest(dest));
	const copySwStream = gulp.src('src/assets/js/sw.js').pipe(gulp.dest('build'));
	const coreStream = gulp.src(core)
		.pipe(order([
			'onload.js',
			'**/*.js'
		]))
		.pipe(rmDebug())
		.pipe(concat('scripts.min.js'))
		.pipe(sourcemaps.init())
		.pipe(jsUgly({ toplevel: true }))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(dest));
	return merge(loadSwStream, copySwStream, coreStream);
};

module.exports.dev = function() {
	const copySwStream = gulp.src('src/assets/js/sw.js').pipe(gulp.dest('build'));
	const coreStream = gulp.src(core).pipe(gulp.dest(dest));
	const loadSwStream = gulp.src(loadSw).pipe(gulp.dest(dest));

	return merge(coreStream, loadSwStream, copySwStream);
};
