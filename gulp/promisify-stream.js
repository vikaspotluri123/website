module.exports = function promisifyStream(stream) {
	return new Promise((resolve, reject) => {
		stream.on('finish', resolve).on('error', reject)
	});
};
