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
	initialBottomOffsetTop = $('.bottom').offset().top - 20,
	translate3dSupported = animation.has3d(),
	initialDiff = $(hero).offset().top + hero.clientHeight - $(bottom).offset().top,
	initialBottomOffset = $(window).height() - initialBottomOffsetTop;

	var dH = $(document).height();
	var wH = $(window).height();
	var pxToScroll = dH - wH;
	if(initialBottomOffset > pxToScroll) {
		var pxToAdd = initialBottomOffset - pxToScroll;
			pxToAdd *= 0.5;
			// pxToAdd = pxToAdd >= 150 ? 150 : pxToAdd;
		var newHeight = $('.bottom').height() + pxToAdd;
		$('.bottom').height(newHeight);
	}

/**
 * Generic Init funciton for page
 */
function init(){
	Waves.attach('.button', [ 'waves-block', 'waves-classic']);
	Waves.init();

	initialBottomOffsetTop = $('.bottom').offset().top - 20;

	slick.loadHighlights();

	animation.enableHover();
	animation.enableDropdown();

	resizeCall();
	updateElements();
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

	var bottomOffset = initialBottomOffset - window.pageYOffset;
		bottomOffset = bottomOffset < 0 ? 0 : bottomOffset;

	var heroOffset = window.pageYOffset * 0.75,
		offsetDif = bottomOffset - heroOffset;

	if (offsetDif <= 0) {
		heroOffset += offsetDif;
	}

	var navOffset = -offsetDif;
		navOffset = navOffset >= 0 ? 0 : navOffset;

	animation.translateY3d(nav, navOffset, translate3dSupported);
	animation.translateY3d(bottom, bottomOffset, true);
	animation.translateY3d(hero, heroOffset, true);

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