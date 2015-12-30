var modalTransitionLength = 300;

var nav = document.getElementById('_nav'),
	navList = nav.children[1],
	modalActions = document.getElementsByClassName('modal-action'),
	navActions = nav.getElementsByTagName('li'),
	footerActions = document.getElementById('footer-actions').children;

for (var i = 0; i < navActions.length; i++) {
	navActions[i].addEventListener('click', handleClick);
};

for (var i = 0; i < footerActions.length; i++) {
	footerActions[i].addEventListener('click', handleClick);
};

for (var i = 0; i < modalActions.length; i++) {
	modalActions[i].addEventListener('click', handleClick);
};

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

		showModal(item.dataset.modal);

	}
	//Back to landing page transition
	else if(event == 'landing'){

		returnToIndex();
	}
}

function returnToIndex() {

	//Update window history state
	window.history.replaceState({home: 'landing'}, "home", '');

	$('#_nav, .modal').velocity('fadeOut', { 
		duration: modalTransitionLength, 
		complete: function(){

			navList.children[0].style.display = 'inline-block';
			navList.children[1].style.display = 'inline-block';
			navList.children[2].style.display = 'none';
			nav.className = nav.className.replace(/\btransparent\b/,'');

			$('#_nav, .landing, .footer').velocity('fadeIn', { duration: modalTransitionLength} );

		}
	}); 

}


/**
 * Presents a modal
 * @param  {string} modal Modal's unique identifier
 */
function showModal(modalId) {

	var modal = document.getElementById('_' + modalId),
		stateObj = {modal : modalId};

		console.log('Modaling');

	console.log(modal);

	//Update window history state
	window.history.pushState(stateObj, "modal", modalId);

	//Coming from landing page
	if($('.hero-wrap').css('display') == 'block'){

		console.log('From landing');

		$('.landing, #_nav, .footer').velocity('fadeOut', { 
			duration: modalTransitionLength, 
			complete: function(){

				$(modal).velocity({ translateY : '100%' }, {
					duration: 0, 
					delay: 500,
					complete: function(){

						navList.children[0].style.display = 'none';
						navList.children[1].style.display = 'none';
						navList.children[2].style.display = 'inline-block';
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


window.onpopstate = function(event) {

	if(event.state && event.state.modal){

		showModal(event.state.modal);

	}
	else{

		returnToIndex();

	}
}
