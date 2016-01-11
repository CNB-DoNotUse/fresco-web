 var screen = {
		tablet: 1024, 
		mobile: 720
	},
	ticking = false, 
	bottom = document.getElementById('_bottom'),
	hero = document.getElementById('_hero'),
	nav = document.getElementById('_nav'),
	lastScrollY = 0,
	navReached = false,
	bottomReached = false,
	initialTranslate = 0,
	translate3dSupported = animation.has3d(),
	initialDiff = $(hero).offset().top + hero.clientHeight - $(bottom).offset().top;

/**
 * Generic Init funciton for page
 */
function init(){
	Waves.attach('.button', [ 'waves-block', 'waves-classic']);
	Waves.init();

	slick.loadHighlights();

	animation.enableHover();
	animation.enableDropdown();

	resizeCall();

	bottom.style.height = bottom.clientHeight + initialDiff + 40 + 'px';
	bottom.style.opacity = 1;
}

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

/**
 * Updates initial diff between hero and bottom
 */
function resizeCall(){

	initialDiff = $(hero).offset().top + hero.clientHeight - $(bottom).offset().top;
	slick.updateArrows();
}

function updateElements(){

	scrollY = window.pageYOffset;

	var heroValue = -scrollY / 8 < 0 ? -scrollY / 8 : 0,
		bottomValue = -scrollY / 1 < 0 ? -scrollY / 1 : 0,
		navValue = -scrollY / .1 < 0 ? scrollY / .1 : 0;

	//Make sure our nav bar stops, and remains at 128px after showing
	if(navValue >= 128 || navReached) {
		navValue = 128;
		navReached = true;
	}

	animation.translateY3d(nav, navValue, translate3dSupported);

	//Check to make sure the bottom value doesn't exceed the inital diff
	if(bottomValue < initialDiff + 80 && !bottomReached){
		bottomValue = initialDiff + 80;
		bottomReached = true;
	}
	else if(bottomReached){
	 	ticking = false;
		return;
	}

	animation.translateY3d(bottom, bottomValue, translate3dSupported);

	// animation.translateY3d(hero, heroValue, translate3dSupported);

	ticking = false;
}

init();

window.addEventListener('resize', function() {
	resizeCall();
});

window.addEventListener('scroll', function(e) {

	//Check if we're not in modal mode
	if(nav.className.indexOf('transparent') > -1) return;

	//Check if translate3dSupported is suppored or if not animating 
	if(!translate3dSupported || ticking) return;

	window.requestAnimFrame(function(){

		updateElements();

	});

	ticking = true;

});