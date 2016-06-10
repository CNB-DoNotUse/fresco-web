/**
 * Nav object contrusctor
 * @description Manages transitions between landing and modals
 * @param {object} screen Screen property containing pixel widths for specific devices
 */
var Nav = function(screen){
	this.screen = screen;
	this.modalTransitionLength = 300;
	this.landingWrap = document.getElementById('_landing-wrap');
	this.navElement = document.getElementById('_nav');
	this.navList = this.navElement.getElementsByTagName('ul')[0].children;
	this.modals = document.getElementsByClassName('modal');
	this.modalActions = document.getElementsByClassName('modal-action');
	this.footerList = document.getElementById('footer-actions').children;
	this.transitioning = false;
	this.scrolling = false;

	//Set the active modal if it exists
	for (var i = 0; i < this.modals.length; i++) {
		if(this.modals[i].className.indexOf('active') > -1){
			window.modal = this.modals[i];
			//Load the script for the specific modal
			this.loadScript('/js/handlers/modals/' + window.modal.id.slice(1) + '.js');
			break;
		}
	}

	//Concatinating all of these is tricky, requires slicing out the first few elements
	for (var i = 0; i < this.modalActions.length; i++) {
		this.modalActions[i].addEventListener('click', this.handleClick.bind(this));
	}

	for (var i = 0; i < this.navList.length; i++) {
		this.navList[i].addEventListener('click', this.handleClick.bind(this));
	}

	for (var i = 0; i < this.footerList.length; i++) {
		this.footerList[i].addEventListener('click', this.handleClick.bind(this));
	}

	return this;
};

/**
 * Sends page back to the landing page
 */
Nav.prototype.returnToLanding = function(pushState, callback){
	if(pushState)
		window.history.pushState({landing : true}, null, '/');

	var self = this;

	$(window.modal).velocity({ translateY : '150%' }, { 
		duration: 450, 
		easing: 'ease-out',
		complete: function(){

			//Hide the modal after the animation
			window.modal.style.display = 'none';
			window.modal.className = window.modal.className.replace(/\bactive-modal\b/,'');
			window.modal = null;
			
			$(self.navElement).velocity('fadeOut', { 
				duration: self.modalTransitionLength, 
				complete: function(){

					//Reset the wrapper height
					$('.wrapper').removeClass('full');

					//Adjust nav menu list items to reflect the page
					self.navList[0].style.display = 'inline-block';
					self.navList[1].style.display = 'inline-block';
					self.navList[3].style.display = 'inline-block';
					self.navList[2].style.display = 'none';
					self.navElement.className = self.navElement.className.replace(/\btransparent\b/,'');

					$('#_nav, #_landing-wrap, #_footer').velocity('fadeIn', { 
						duration: self.modalTransitionLength, 
						complete: function() {
								
							setTimeout(function(){
								//Resize and re-init landing after getting back
								landing.resize();
								landing.indexInit();
							}, 500);


							if(callback) callback(); //Tell the callback we'redone
						}
					});
				}
			});
		}
	});
}

/**
 * Presents a modal
 * @param  {string} modal Modal's unique identifier
 */
Nav.prototype.loadModal = function(modalId, pushState, callback) {
	var modal = document.getElementById('_' + modalId),
		fromLanding = this.landingWrap.style.display == 'block' || this.landingWrap.style.display == '',
		self = this;

	if(window.modal === modal){
        if(callback) return callback();
    }

	//Save modal to window
	window.modal = modal;

	//Add class for proper height on wrapper
	$('.wrapper').addClass('full');

	//Update window history state
	if(pushState)
		window.history.pushState({modal : modalId}, null, modalId);

	this.loadScript('/js/handlers/modals/' + modalId + '.js');

	//Coming from landing page
	if(fromLanding){
		//Fade out landing page elements
		$('#_landing-wrap, #_nav, #_footer').velocity('fadeOut', { 
			duration: this.modalTransitionLength, 
			complete: function(){

				//Push modal down
				$(modal).velocity({ translateY : '100%' }, {
					duration: 0, 
					delay: 0,
					complete: function(){

						//Adjust nav menu list items to reflect the page
						self.navList[0].style.display = 'none';
						self.navList[1].style.display = 'none';
						self.navList[3].style.display = 'inlie-block';
						self.navList[2].style.display = 'inline-block';
						self.navElement.className += ' transparent';
						
						//Make the modal visible so that we can bring it up
						modal.style.display = 'block';
						modal.style.opacity = 1;
						
						//Fade in Nav element
						$(self.navElement).velocity({ opacity: 1 }, { display: "block" });
						//Bring in modal
						$(modal).velocity({ translateY : '0'}, { duration: self.modalTransitionLength, easing: 'ease-out' });

						//Call resize to configure elements properly
						landing.resize();

						if(callback) callback(); //Tell the callback we'redone
					}
				});
			}
		}); 
	} else{
		$('.modal').velocity('fadeOut', {
			duration: this.modalTransitionLength,
			complete: function() {

				$(modal).velocity({ translateY : '100%' }, {
					duration: 0, 
					delay: 500,
					complete: function(){
						modal.style.display = 'block';
						modal.style.opacity = 1;

						$(modal).velocity(
							{ translateY : '0'}, 
							{ 
								duration: self.modalTransitionLength, 
								easing: 'ease-out', 
								complete: function(){
									//Call resize to configure elements properly
									landing.resize();

									//Tell the callback we'redone
									if(callback) callback();
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
 * Click listener for navigaiton actions
 */
Nav.prototype.handleClick = function(e){
    var item = e.target,
    	event = item.dataset.event,
    	self = this;

    //Scroll Event
    if(event == 'scroll' && !this.scrolling){
    	var element = document.getElementById(item.dataset.element);

    	self.scrolling = true;

    	//Scroll to element
    	$("html").velocity("scroll", { 
    		offset: $(element).offset().top - 150, 
    		mobileHA: false,  
    		duration: 1000,
    		complete: function() {
    			self.scrolling = false;
    		}
    	});
    }
    //Modal Transition
    else if(event == 'modal'){
    	if(self.transitioning) return;

    	self.transitioning = true;

    	this.loadModal(item.dataset.modal, true, function() {
    		self.transitioning = false;
    	});
    }
    //Back to landing page transition
    else if(event == 'landing') {
    	if(self.transitioning) return;

    	self.transitioning = true;

    	self.returnToLanding(true, function() {
    		self.transitioning = false;
    	});
    }
};

/**
 * Adds script to dom
 * @param {string} src Source of the script to load
 */
Nav.prototype.loadScript = function(src) {
	//Check if script exists first
	var scripts = document.getElementsByTagName('script'),
		srcToAddFileName = src.substring(src.lastIndexOf('/')+1),
		exists = false;
    for (var i = scripts.length; i--;) {
    	var fileName = scripts[i].src.substring(scripts[i].src.lastIndexOf('/')+1);

        if (srcToAddFileName == fileName) {
        	exists = true;
        	break;
        }
    }

    if(exists) return;

	//Add script to dom
	var s = document.createElement('script');
		s.type = 'text/javascript';
		s.async = true;
		s.src = src;
		var x = document.getElementsByTagName('script')[0];
		x.parentNode.insertBefore(s, x);
}

/**
 * Resizes relevent elements
 * @param  {integer} width pixel width of the current screen
 */
Nav.prototype.resize = function navResize(width) {
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