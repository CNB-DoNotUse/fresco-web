global.jQuery = require('jquery');
require('snackbarjs');
require('velocity-animate');
require('alerts');
const Landing = require('../components/landing.js');
import startChat from 'app/chat';
import '../../sass/public/index/index.scss';

const screen = {
    tablet: 1024,
    mobile: 720
};

let landing = new Landing(screen);
window.landing = landing;

$(document).ready(() => {
	landing.init(); 
    startChat();
});

window.addEventListener('resize', () => {
	landing.resize();
});

// requestAnim shim layer by Paul Irish
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          window.oRequestAnimationFrame      ||
          window.msRequestAnimationFrame     ||
          function(/* function */ callback, /* DOMElement */ element){
			window.setTimeout(callback, 1000 / 60);
          };
})();

window.addEventListener('scroll', (e) => {
	landing.scroll(e);
});

window.onpopstate = (event) => {
	if(event.state === null) {
		landing.nav.returnToLanding(true, null);
	} else if(event.state.landing === true) {
		landing.nav.returnToLanding(false, null);
	} else if(event.state.modal !== null) {
		landing.nav.presentModal(event.state.modal);
	}
}
