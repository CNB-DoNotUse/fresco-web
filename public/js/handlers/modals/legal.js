var termsTab = document.getElementById('terms-tab'),
	privacyTab = document.getElementById('privacy-tab'),
	terms = document.getElementById('terms'),
	privacy = document.getElementById('privacy');

window.onload = function() {
	
	updateLegalElements(window.innerWidth);

	if(window.location.href.indexOf('privacy') > -1) {
		showPrivacy();
	}
}

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
		
	} else if(window.innerWidth < screen.mobile){
		termsTab.innerHTML = 'Terms';
		privacyTab.innerHTML = 'Privacy';
	}
}

function showTerms() {
	termsTab.className = 'tab';
	terms.style.display = 'block';

	privacyTab.className = 'tab inactive';
	privacy.style.display = 'none';
}

function showPrivacy() {
	privacyTab.className = 'tab';
	privacy.style.display = 'block';

	terms.style.display = 'none';
	termsTab.className = 'tab inactive';
}

/**
 * Toggling listerns for `Privacy Policy` and `Terms of Service`
 */
termsTab.addEventListener('click', showTerms);

privacyTab.addEventListener('click', showPrivacy);