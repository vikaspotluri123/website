// require('dotenv').config()
import {terser} from 'rollup-plugin-terser';

const production = !process.env.ROLLUP_WATCH;

const baseConfig = {
	input: 'src/assets/js/*.js',
	output: {
		sourcemap: true,
		format: 'iife',
		dir: './dist/js'
	},
	plugins: [
		production && terser()
	],
	watch: {
		clearScreen: false
	}
};

async function buildConfig() {
	const {readdir} = require('fs').promises;
	const base = './src/assets/js';

	const files = await readdir(base);
	const config = [];

	for (const file of files) {
		if (file === 'components') {
			continue;
		}

		config.push(Object.assign({}, baseConfig, {
			input: `${base}/${file}`
		}));
	}

	return config;
}

export default buildConfig();
