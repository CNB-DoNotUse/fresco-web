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

function updateElements() {
	var val = (window.pageYOffset) - 256;

	// Don't move up too much.
	val = val < -128 ? -128 : val;
	// Don't move down too much.
	val = val > 0 ? 0 : val;

	animation.translateY3d(nav, val, translate3dSupported);

	ticking = false;
}

init();
x();

function x() {
	console.log($('.bottom').offset().top);
	animation.translateY3d(bottom, window.pageYOffset, true);
}
window.addEventListener('resize', function() {
	x();
	resizeCall();
});

window.addEventListener('scroll', function(e) {

	x();

	//Check if we're not in modal mode
	if(nav.className.indexOf('transparent') > -1) return;

	//Check if translate3dSupported is suppored or if not animating 
	if(!translate3dSupported || ticking) return;

	window.requestAnimFrame(function(){

		updateElements();

	});

	ticking = true;

});