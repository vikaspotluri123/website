// require('dotenv').config()
import {readdir} from 'node:fs/promises';
import {terser} from 'rollup-plugin-terser';

const production = !process.env.ROLLUP_WATCH;

const baseConfig = {
	input: 'src/assets/js/*.js',
	output: {
		sourcemap: !production,
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
	const base = './src/assets/js';

	const files = await readdir(base);
	const config = [];

	for (const file of files) {
		if (file === 'components' || file === 'built') {
			continue;
		}

		config.push(Object.assign({}, baseConfig, {
			input: `${base}/${file}`
		}));
	}

	return config;
}

export default buildConfig();
