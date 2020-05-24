const hbs = require('handlebars');

module.exports = function blockHelper(name, options) {
	if (typeof options.fn === 'function') {
		this.blockData = this.blockData || {};
		this.blockData[name] = this.blockData[name] || [];
		this.blockData[name].push(options.fn(this));
		return '';
	}

	const props = (this.blockData || {})[name] || [];
	return new hbs.SafeString(props.join('\n'));
}
