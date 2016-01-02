var modalTransitionLength = 300,
	nav = document.getElementById('_nav'),
	navList = nav.getElementsByTagName('ul')[0].children,
	modals = document.getElementsByClassName('modal'),
	footerList = document.getElementById('footer-actions').children;

//Set the active modal if it exists
for (var i = 0; i < modals.length; i++) {
	if(modals[i].className.indexOf('active') > -1){
		window.modal = modals[i];
		loadScript('/js/handlers/modals/' + window.modal.id.slice(1) + '.js');
		break;
	}
};

for (var i = 0; i < navList.length; i++) {
	navList[i].addEventListener('click', handleClick);
};

for (var i = 0; i < footerList.length; i++) {
	footerList[i].addEventListener('click', handleClick);
};


/**
 * Click listener for navigaitona actions
 */

function handleClick(e) {

	var item = e.target,
		event = item.dataset.event;

	//Scroll Event
	if(event == 'scroll'){

		var element = document.getElementById(item.dataset.element);

		//Scroll to element
		$("html").velocity("scroll", { offset: $(element).offset().top - 150, mobileHA: false,  duration: 1400 });

	}
	//Modal Transition
	else if(event == 'modal'){

		loadModal(item.dataset.modal);

	}
	//Back to landing page transition
	else if(event == 'landing'){

		returnToLanding();
	}
}

/**
 * Sends back to the landing page
 */
function returnToLanding() {

	//Update window history state
	window.history.replaceState({home: 'landing'}, "home", '');

	$(window.modal).velocity({ translateY : '150%' }, { duration: 450, easing: 'ease-out'});

	$('#_nav').velocity('fadeOut', { 
		duration: modalTransitionLength, 
		complete: function(){

			//Hide the modal after the animation
			window.modal.style.display = 'none';

			//Adjust nav menu list items to reflect the page
			navList[0].style.display = 'inline-block';
			navList[1].style.display = 'inline-block';
			navList[3].style.display = 'inline-block';
			navList[2].style.display = 'none';
			nav.className = nav.className.replace(/\btransparent\b/,'');

			$('#_nav, .landing, .footer').velocity('fadeIn', { duration: modalTransitionLength} );

		}

	});
}


/**
 * Presents a modal
 * @param  {string} modal Modal's unique identifier
 */

function loadModal(modalId) {

	var modal = document.getElementById('_' + modalId),
		stateObj = {modal : modalId};

	//Save modal to winodw
	window.modal = modal;

	//Update window history state
	window.history.pushState(stateObj, "modal", modalId);

	loadScript('/js/handlers/modals/' + modalId + '.js');

	//Coming from landing page
	if($('.hero-wrap').css('display') == 'block'){


		//Fade out landing page elements
		$('.landing, #_nav, .footer').velocity('fadeOut', { 
			duration: modalTransitionLength, 
			complete: function(){

				$(modal).velocity({ translateY : '100%' }, {
					duration: 0, 
					delay: 500,
					complete: function(){

						//Adjust nav menu list items to reflec tthe pag 
						navList[0].style.display = 'none';
						navList[1].style.display = 'none';
						navList[2].style.display = 'inline-block';
						nav.className += ' transparent';
						modal.style.display = 'block';
						modal.style.opacity = 1;

						$(nav).velocity({ opacity: 1 }, { display: "block" });
						$(modal).velocity({ translateY : '0'}, { duration: modalTransitionLength, easing: 'ease-out' });

					}
				});
			}
		}); 

	}
	else{

		$('.modal').velocity('fadeOut', {
			duration: modalTransitionLength,
			complete: function() {

				$(modal).velocity({ translateY : '100%' }, {
					duration: 0, 
					delay: 500,
					complete: function(){

						modal.style.display = 'block';
						modal.style.opacity = 1;

						$(modal).velocity({ translateY : '0'}, { duration: modalTransitionLength, easing: 'ease-out' });

					}
				});
			}
		})
	}
}

/**
 * Adds script to dom
 * @param {string} src Source of the script to load
 */

function loadScript(src){
	//Add script to dom
	var s = document.createElement('script');
		s.type = 'text/javascript';
		s.async = true;
		s.src = src;
		var x = document.getElementsByTagName('script')[0];
		x.parentNode.insertBefore(s, x);
}

window.onpopstate = function(event) {

	console.log(event);

	if(event.state && event.state.modal){

		loadModal(event.state.modal);

	}
	else{
		console.log('Test');

		returnToLanding();

	}
}
