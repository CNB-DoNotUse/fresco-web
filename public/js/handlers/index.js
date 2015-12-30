var screen = {
	tablet: 1024, 
	mobile: 720
}

function init(){

	Waves.attach('.button', ['waves-button', 'waves-block', 'waves-classic']);
	Waves.init();

	slick.loadHighlights();

	animation.enableHover();
	animation.enableDropdown();
}

//Call init
init();

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

var ticking = false, 
	bottom = document.getElementById('_bottom'),
	bottomWrap = document.getElementById('_bottom-wrap'),
	hero = document.getElementById('_hero'),
	nav = document.getElementById('_nav'),
	lastScrollY = 0,
	navReached = false,
	translate3dSupported = animation.has3d();

window.addEventListener('scroll', function(e) {

	//Check if we're not in modal mode
	if(nav.className.indexOf('transparent') > -1) return;

	//Check if translate3dSupported is suppored or Check if not animating 
	if(!translate3dSupported || ticking) return;

	var diff = $(hero).offset().top + hero.clientHeight - $(bottom).offset().top;

	//Check if maximum space difference 
	//between the hero and the cards is reached
	if(diff > 0){ 

		//Check direciton of scroll
		if(!(lastScrollY > window.pageYOffset))
			return;

	}

	window.requestAnimFrame(function(){

		lastScrollY = window.pageYOffset;

		var heroValue = -lastScrollY / 6 < 0 ? -lastScrollY / 6 : 0,
			bottomValue = -lastScrollY / .3 < 0 ? -lastScrollY / .3 : 0,
			navValue = -lastScrollY / .5 < 0 ? lastScrollY / .5 : 0;

		console.log('Expected Position', diff + -bottomValue);

		//Make sure our nav bar stops, and remains at 96px after showing
		if(navValue >= 96 || navReached) {
			navValue = 96;
			navReached = true;
		}
		
		animation.translateY3d(hero,   heroValue);
		animation.translateY3d(bottom, bottomValue);
		animation.translateY3d(nav,    navValue);


		ticking = false;

	});

	ticking = true;

});