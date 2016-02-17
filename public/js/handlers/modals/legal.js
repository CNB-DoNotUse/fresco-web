var termsTab = document.getElementById('terms-tab'),
	privacyTab = document.getElementById('privacy-tab'),
	terms = document.getElementById('privacy'),
	privacy = document.getElementById('terms');

//Run on load
updateLegalElements(window.innerWidth);

window.addEventListener('resize', function() {

	updateLegalElements(window.innerWidth);

});

/**
 * Updates the postion of the account modal elements
 */

function updateLegalElements(width){
	if(window.innerWidth > screen.tablet){
		termsTab.innerHTML = 'Terms of Service';
		privacyTab.innerHTML = 'Privacy Policy';
		
	}
	else if(window.innerWidth < screen.mobile){
		termsTab.innerHTML = 'Terms';
		privacyTab.innerHTML = 'Privacy';
	}
}

/**
 * Toggling listerns for `Privacy Policy` and `Terms of Service`
 */

termsTab.addEventListener('click', function() {

	termsTab.className = 'tab';
	terms.style.display = 'none';

	privacyTab.className = 'tab inactive';
	privacy.style.display = 'block';

});


privacyTab.addEventListener('click', function() {

	privacyTab.className = 'tab';
	privacy.style.display = 'none';

	termsTab.className = 'tab inactive';
	terms.style.display = 'block';

});