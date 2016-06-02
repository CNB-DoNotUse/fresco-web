var screen = {
    tablet: 1024, 
    mobile: 720
};

var landing = new Landing(screen);

window.onload = function() {
	landing.init();

	var modal = window.location.href.substr(window.location.href.lastIndexOf('/') + 1);

 	//Set initial history state
	if(modal === '') {
		window.history.replaceState({landing : true}, null, '/');
	} else {
		window.history.pushState({modal : modal}, null, modal);
	}
};

window.addEventListener('resize', function() {
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

window.addEventListener('scroll', function(e) {
	landing.scroll(e);
});

window.onpopstate = function(event) {
	if(event.state === null) {
		landing.nav.returnToLanding(true, null);
	} else if(event.state.landing === true) {
		landing.nav.returnToLanding(false, null);
	} else if(event.state.modal !== null) {
		landing.nav.loadModal(event.state.modal);
	}
}