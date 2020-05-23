const sentenceCase = thing => thing.replace(/(^[a-z]|\s[a-z])/, match => match.toUpperCase());

module.exports = function computeSEO(context) {
	const meta = {};
	meta.image = new URL(this.seoImage || '/img/site-cover.png', 'https://vikaspotluri.me').href;
	meta.description = this.description || 'Vikas Potluri - passionate hardware and software engineer';
	meta.full_url = new URL(this.page.url, 'https://vikaspotluri.me').href;

	const fallback = this.title || sentenceCase(this.page.fileSlug);
	meta.title = this.fullTitle || `${fallback} - Vikas Potluri`

	return context.fn(meta);
}
