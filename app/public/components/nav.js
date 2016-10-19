/**
 * Nav object contrusctor
 * @description Manages transitions between landing and modals
 * @param {object} screen Screen property containing pixel widths for specific devices
 */
let Nav = function(screen){
    this.modalElm = null;

    this.loadedModals = [];

	this.screen = screen;
	this.modalTransitionLength = 300;
	this.landingWrap = document.getElementById('_landing-wrap');
	this.navElement = document.getElementById('_nav');
    this.navList = this.navElement.getElementsByTagName('ul')[0].children;

	this.transitioning = false;
	this.scrolling = false;

    //Run this here so we're not waiting to initialize and the script is ready immediatelly
    let modals = document.getElementsByClassName('modal');
    for (var i = 0; i < modals.length; i++) {
        //Set the active modal if it exists
        if(modals[i].className.indexOf('active') > -1){
            window.modal = modals[i];
            this.loadModal(window.modal.id.slice(1));
            break;
        }
    }

	return this;
};

/**
 * Initialize navigation on the landing page
 */
Nav.prototype.init = function() {
    const modalActions = document.getElementsByClassName('modal-action');
    const footerList = document.getElementById('footer-actions').children;

    //Concatinating all of these is tricky, requires slicing out the first few elements
    this.addEventListenerToList(modalActions, 'click', this.handleClick.bind(this));
    this.addEventListenerToList(this.navList, 'click', this.handleClick.bind(this));
    this.addEventListenerToList(footerList, 'click', this.handleClick.bind(this));
}

/**
 * Adds passed event listener to HTML NodeList
 */
Nav.prototype.addEventListenerToList = function(list, event, fn) {
    for (let i = 0, len = list.length; i < len; i++) {
        list[i].addEventListener(event, fn, false);
    }
}

/**
 * Sends page back to the landing page
 */
Nav.prototype.returnToLanding = function(pushState, callback = () => {}){
	if(pushState) {
		window.history.pushState({landing : true}, null, '/');
    }

	$(window.modal).velocity({ translateY : '150%' }, { 
		duration: 450, 
		easing: 'ease-out',
		complete: () => {

			//Hide the modal after the animation
			window.modal.style.display = 'none';
			window.modal.className = window.modal.className.replace(/\bactive-modal\b/,'');
			window.modal = null;
			
			$(this.navElement).velocity('fadeOut', { 
				duration: self.modalTransitionLength, 
				complete: () => {

					//Reset the wrapper height
					$('.wrapper').removeClass('full');

					//Adjust nav menu list items to reflect the page
					this.navList[0].style.display = 'inline-block';
					this.navList[1].style.display = 'inline-block';
					this.navList[3].style.display = 'inline-block';
					this.navList[2].style.display = 'none';
					this.navElement.className = this.navElement.className.replace(/\btransparent\b/,'');

					$('#_nav, #_landing-wrap, #_footer').velocity('fadeIn', { 
						duration: this.modalTransitionLength, 
						complete: () => {
								
							setTimeout(() => {
								//Resize and re-init landing after getting back
								window.landing.resize();
								window.landing.indexInit();
							}, 500);

							callback(); //Tell the callback we'redone
						}
					});
				}
			});
		}
	});
}

/**
 * Loads modal through require context and inits it using prototype method
 */
Nav.prototype.loadModal = function(m) {
    if(this.loadedModals.indexOf(m) > -1) {
        return;
    }

    this.loadedModals.push(m);

    switch(m) {
        case 'account':
            require.ensure(['./modals/account'], (require) => {
                this.handleModal(require("./modals/account"));
            }, 'account');
            break;
        case 'legal':
            require.ensure(['./modals/legal'], (require) => {
                this.handleModal(require("./modals/legal"));
            }, 'legal');
            break;
        case 'join':
            require.ensure(['./modals/join'], (require) => {
                this.handleModal(require("./modals/join"));
            }, 'join');
            break;
        case 'reset':
            require.ensure(['./modals/reset'], (require) => {
                this.handleModal(require("./modals/reset"));
            }, 'reset');
            break;
        case 'forgot':
            require.ensure(['./modals/forgot'], (require) => {
                this.handleModal(require("./modals/forgot"));
            }, 'forgot');
            break;
        case 'contact':
            require.ensure(['./modals/contact'], (require) => {
                this.handleModal(require("./modals/contact"));
            }, 'contact');
            break;
    }
}

Nav.prototype.handleModal = function(passedPrototype) {
    //Require and init modal through prototype
    const modal = new passedPrototype(this.screen);
    modal.init();
}

/**
 * Presents a modal
 * @param  {string} modal Modal's unique identifier
 */
Nav.prototype.presentModal = function(modalId, pushState, callback = ()=>{}) {
	let modalElm = document.getElementById('_' + modalId),
		fromLanding = this.landingWrap.style.display == 'block' || this.landingWrap.style.display == '';

	if(window.modal === modalElm){
        return callback();
    }

	//Save modal to window
    window.modal = modalElm;
    //Load modal JS file
    this.loadModal(window.modal.id.slice(1));
    //Update window history state
    if(pushState)
        window.history.pushState({modal : modalId}, null, modalId);

    //Add class for proper height on wrapper
    $('.wrapper').addClass('full');

	//Coming from landing page
	if(fromLanding){
		//Fade out landing page elements
		$('#_landing-wrap, #_nav, #_footer').velocity('fadeOut', { 
			duration: this.modalTransitionLength, 
			complete: () => {

				//Push modal down
				$(modalElm).velocity(
                    { translateY : '100%' }, 
                    {
    					duration: 0, 
    					delay: 0,
    					complete: () => {
    						//Adjust nav menu list items to reflect the page
    						this.navList[0].style.display = 'none';
    						this.navList[1].style.display = 'none';
    						this.navList[3].style.display = 'inlie-block';
    						this.navList[2].style.display = 'inline-block';
    						this.navElement.className += ' transparent';
    						
    						//Make the modal visible so that we can bring it up
    						modalElm.style.display = 'block';
    						modalElm.style.opacity = 1;
    						
    						//Fade in Nav element
    						$(this.navElement).velocity({ opacity: 1 }, { display: "block" });
    						//Bring in modal
    						$(modalElm).velocity({ translateY : '0'}, { duration: this.modalTransitionLength, easing: 'ease-out' });

    						//Call resize to configure elements properly
    						window.landing.resize();

    						callback();
    					}
    				}
                );
			}
		}); 
	} else{
		$('.modal').velocity('fadeOut', {
			duration: this.modalTransitionLength,
			complete: () => {

				$(modalElm).velocity({ translateY : '100%' }, {
					duration: 0, 
					delay: 500,
					complete: () => {
						modal.style.display = 'block';
						modal.style.opacity = 1;

						$(modalElm).velocity(
							{ translateY : '0'}, 
							{ 
								duration: this.modalTransitionLength, 
								easing: 'ease-out', 
								complete: function(){
									//Call resize to configure elements properly
									window.landing.resize();

									callback();
								}
							}
						);
					}
				});
			}
		});
	}
}

/**
 * Click listener for navigation actions
 */
Nav.prototype.handleClick = function(e){
    let item = e.target,
    	event = item.dataset.event;

    //Scroll Event
    if(event == 'scroll' && !this.scrolling){
    	let element = document.getElementById(item.dataset.element);

    	this.scrolling = true;

    	//Scroll to element
    	$("html").velocity("scroll", { 
    		offset: $(element).offset().top - 150, 
    		mobileHA: false,  
    		duration: 1000,
    		complete: () => {
    			this.scrolling = false;
    		}
    	});
    }
    //Modal Transition
    else if(event == 'modal'){
    	if(this.transitioning) return;

    	this.transitioning = true;

    	this.presentModal(item.dataset.modal, true, () => {
    		this.transitioning = false;
    	});
    }
    //Back to landing page transition
    else if(event == 'landing') {
    	if(this.transitioning) return;

    	this.transitioning = true;

    	this.returnToLanding(true, () => {
    		this.transitioning = false;
    	});
    }
};


/**
 * Resizes relevent elements
 * @param  {integer} width pixel width of the current screen
 */
Nav.prototype.resize = function(width) {
    Nav.prototype

	if(window.modal && window.modal.className.indexOf('xs') > -1){
		if(window.innerWidth < this.screen.mobile){
			this.navElement.style.display = 'none';
		} else{
			this.navElement.style.display = 'block';
		}
	} else{
		this.navElement.style.display = 'block';
	}
}


module.exports = Nav;