import Verb from './components/verb.js';
import ActiveNav from './components/active-nav';

window.__components = {
	verb: new Verb(document.getElementById('verb')),
	nav: new ActiveNav(document.querySelector('.vertical-nav--items'))
};
