let copyrightText = '2020';
const currentYear = new Date().getFullYear();

if (currentYear !== 2020) {
	copyrightText += `-${currentYear}`;
}

module.exports = copyrightText;
