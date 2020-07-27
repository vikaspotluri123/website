let proxySingleton;
let instance;

/**
 * @param {import('browser-sync').Options} bsOverrides
 * @returns {import('browser-sync').BrowserSyncInstance}
 */
module.exports = function getLiveReloadInstance(bsOverrides = {}) {
	if (instance) {
		return instance;
	}

	const liveReload = require('browser-sync');
	const {createProxyMiddleware} = require('http-proxy-middleware');
	proxySingleton = createProxyMiddleware({
		logLevel: 'silent',
		target: 'http://127.0.0.1:2368',
		autoRewrite: true,
		changeOrigin: true
	});

	instance = liveReload.init({
		server: './dist/',
		snippetOptions: {
			ignorePaths: 'blog/ghost*'
		},
		watch: false,
		open: false,
		notify: false,
		middleware: [(req, res, next) => {
			// NOTE: we can't do BS-path matching because the url can't be re-written
			req.url = req.url.startsWith('/blog/assets') && !req.url.includes('cross-bg') ? req.url.replace('/blog/assets', '') : req.url;
			next();
		}, {
			route: '/blog',
			handle: proxySingleton
		}],
		...bsOverrides
	});

	return instance;
};
