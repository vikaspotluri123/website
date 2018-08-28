'use strict';

const gulp = require('gulp');

// Filesystem related assets
const del = require('del');
const changed = require('gulp-changed');

const sass = require('gulp-sass');
const css = require('./tasks/css');
const js = require('./tasks/js');
const cachebust = require('./tasks/cachebust');
const buildHtml = require('./tasks/build-html');
// const browserSync = require('browser-sync').create();

gulp.on('err', function () {
	console.log(error);
	this.emit('end');
});

gulp.task('clean', () =>
	Promise.all([
		del('./build/assets/js/**/*'),
		del('./dist/assets/js/**/*'),
		del('./build/assets/css/**/*'),
		del('./dist/assets/css/**/*'),
		del('./build/assets/*.html'),
		del('./build/assets/*.json')
	])
);

gulp.task('sass', () =>
	gulp.src('src/assets/sass/**/*.scss')
		.pipe(sass().on('error', sass.logError))
		.pipe(gulp.dest('build/assets/css'))
);

gulp.task('copy-assets', () =>
	gulp.src([
		'src/assets/**/*',
		'!src/assets/js/**/*',
		'!src/assets/sass/*',
		'!src/assets/sass'
	]).pipe(changed('build/assets'))
		.pipe(gulp.dest('build/assets'))
);

gulp.task('dev:css', css.dev);
gulp.task('prod:css', css.prod);
gulp.task('dev:js', js.dev);
gulp.task('prod:js', js.prod);
gulp.task('dev:html', buildHtml.dev);
gulp.task('prod:html', buildHtml.prod);
gulp.task('cachebust', cachebust);

gulp.task('build:core',
	gulp.series('clean', 'sass', 'copy-assets')
);

gulp.task('build:dev',
	gulp.series('build:core', gulp.parallel('dev:css', 'dev:js'), 'dev:html')
);

gulp.task('build:prod',
	gulp.series('build:core', gulp.parallel('prod:css', 'prod:js'), 'cachebust', 'prod:html')
);

gulp.task('watch',
	gulp.series('build:dev', function watch() {
		return gulp.watch('src/**/**/*', gulp.series('build:dev'))
	})
);
gulp.task('default', gulp.series('watch'));

gulp.task('dist',
	gulp.series('build:prod', function clone() {
		return gulp.src(['build/**/*', '!build/rev-manifest.json']).pipe(gulp.dest('dist'))
	})
);

process.on('uncaughtException', error => {
	console.log(error);
});
