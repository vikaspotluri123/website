// @ts-check
const {src, dest} = require('gulp');
const promisifyStream = require('./promisify-stream');

const FILE_TO_LARGE = Symbol('file is too large');
const INLINE_THRESHOLD = 20_000; // Don't inline anything over ~20k

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

/**
 * @param {string} fullMatch
 * @param {string} fullAsset
 * @param {string} tagName
 * @param {Map<string, string | Symbol>} knownAssets
 */
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

module.exports = {
	readAllAssets,
	inlineAsset,
	inlineAssetGlob
};
