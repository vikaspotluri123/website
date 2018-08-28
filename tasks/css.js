const gulp = require('gulp');

// Processing assets
const concat = require('gulp-concat');
const csscomb = require('gulp-csscomb');
const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');

// Postprocessing (PostCSS) assets
const customProperties = require('postcss-custom-properties');
const autoprefixer = require('autoprefixer');
const mergeMedia = require('css-mqpacker');
const mergeSelectors = require('postcss-combine-duplicated-selectors');
const cssnano = require('cssnano');

const root = 'build/assets/css/*.css';
const dest = 'build/assets/css';
const processors = (isProd = false) => {
	const defaults = [
		customProperties,
		autoprefixer({browsers: ['last 2 versions']}),
		mergeMedia(),
		mergeSelectors()
	];

	if(isProd) {
		defaults.push(cssnano());
	}

	return defaults;
}

module.exports.prod = function() {
	return gulp.src(root)
		.pipe(concat('styles.min.css'))
		.pipe(csscomb())
		.pipe(sourcemaps.init())
		.pipe(postcss(processors(true)))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(dest));
};

module.exports.dev = function () {
	return gulp.src(root)
		.pipe(csscomb())
		.pipe(postcss(processors(false)))
		.pipe(gulp.dest(dest));
};
