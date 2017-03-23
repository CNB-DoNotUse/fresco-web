import Waves from 'node-waves';
import Slick from './index-slick';
import Animation from './animation';
import Nav from './nav';

/**
 * Landing object constructor
 * @description This encapsualtes the landing page, modals, and navigation
 */
let Landing = function(screen){
    //Initialize screen
    this.screen = screen;

    this.slick = new Slick(this.screen);
    this.nav = new Nav(this.screen);

    this.ticking = false;
    this.bottom = document.getElementById('_bottom');
    this.hero = document.getElementById('_hero');
    this.scrolled = false;
    this.navReached = false;

    this.bottomOffsetTop = $(this.bottom).offset().top - 100; //100 for the absolute green money
    this.bottomOffset = $(window).height() - this.bottomOffsetTop;
}

//Inherit animation prototype
Landing.prototype = new Animation();

/**
 * Full landing init function for page
 */
Landing.prototype.init = function() {
    if(window.location.pathname === '/') { 
        this.indexInit(); 
    }    

    this.nav.init();
    Waves.attach('.button', [ 'waves-block', 'waves-classic']);
    Waves.init();
    this.resize();
    this.enableDropdown();

}

/**
 * Specific inilizaiton for landing page elements
 */
Landing.prototype.indexInit = function() {
    //Set the bottom to visible after initializing
    this.bottom.style.opacity = 1;
    this.slick.loadHighlights();

    this.bottomOffsetTop = $(this.bottom).offset().top - 100; //100 for the absolute green money
    this.bottomOffset = $(window).height() - this.bottomOffsetTop;

    this.updateElements(window.pageYOffset);
}

/**
 * General resize function for landing
 * @description Updates initial diff between hero and bottom on index page
 */
Landing.prototype.resize = function() {
    this.slick.updateArrows();
    this.nav.resize();

    if(window.location.pathname !== '/') return;

    let dH = $(document).height(),
        wH = $(window).height(),
        pxToScroll = dH - wH;

    this.bottomOffset = wH - this.bottomOffsetTop;
    
    if(this.bottomOffset > pxToScroll) {
        var pxToAdd = this.bottomOffset - pxToScroll;
            pxToAdd *= 0.5;
            // pxToAdd = pxToAdd >= 150 ? 150 : pxToAdd;
        var newHeight = $(this.bottom).height() + pxToAdd;

        $(this.bottom).height(newHeight);
    }
}

/**
 * Landing scroll event
 */
Landing.prototype.scroll = function() {
     //Check if we're on the home page
    if(window.location.pathname != '/') return;
    
    //Check if we're not in modal mode
    if(this.nav.navElement.className.indexOf('transparent') > -1) return;

    //Check if the animation is currently running 
    if(this.ticking) return;

    //Set ticking to true to prevent animation until finished
    this.ticking = true;
    window.requestAnimationFrame(() => {
        this.updateElements(window.pageYOffset);
    });
}

/**
 * Updates the position of elements based on scroll position
 * @param  {int} yOffset Current vertical space from top
 */
Landing.prototype.updateElements = function(yOffset) {
    if(window.location.pathname != '/'){ 
        return; 
    }

    let bottomOffset = this.bottomOffset - yOffset;
        bottomOffset = bottomOffset < 0 ? 0 : bottomOffset;

    let heroOffset = yOffset * 0.75,
        offsetDif = bottomOffset - heroOffset;

    if (offsetDif <= 0) {
        heroOffset += offsetDif;
    }

    let navOffset = -offsetDif;
        navOffset = navOffset >= 0 ? 0 : navOffset;
    
    this.translateY3d(this.bottom, bottomOffset);
    this.translateY3d(this.hero, heroOffset);

    if(navOffset >= 0) {
        // navReached = true;
    }

    //Disable ticking when we're done
    this.ticking = false;
}


module.exports = Landing;