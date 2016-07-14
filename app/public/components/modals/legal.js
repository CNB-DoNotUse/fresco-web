/**
 * Legal prototype object
 */
let Legal = function(screen){
	this.screen = screen;
	this.termsTab = document.getElementById('terms-tab');
	this.privacyTab = document.getElementById('privacy-tab');
	this.terms = document.getElementById('terms');
	this.privacy = document.getElementById('privacy');
	
	return this;
};

Legal.prototype.init = function() {
	//Toggling listerns for `Privacy Policy` and `Terms of Service`
	this.termsTab.addEventListener('click', this.showTerms.bind(this));
	this.privacyTab.addEventListener('click', this.showPrivacy.bind(this));
	
	this.updateLegalElements(window.innerWidth);

	if(window.location.href.indexOf('privacy') > -1) {
		this.showPrivacy();
	}
	
	window.addEventListener('resize', () => {
		this.updateLegalElements(window.innerWidth);
	});
}

/**
 * Updates the postion of the account modal elements
 */
Legal.prototype.updateLegalElements = function() {
	if(window.innerWidth > this.screen.tablet){
		this.termsTab.innerHTML = 'Terms of Service';
		this.privacyTab.innerHTML = 'Privacy Policy';
		
	} else if(window.innerWidth < this.screen.mobile){
		this.termsTab.innerHTML = 'Terms';
		this.privacyTab.innerHTML = 'Privacy';
	}
}

Legal.prototype.showTerms = function() {
	this.termsTab.className = 'tab';
	this.terms.style.display = 'block';

	this.privacyTab.className = 'tab inactive';
	this.privacy.style.display = 'none';
}

Legal.prototype.showPrivacy = function() {
	this.privacyTab.className = 'tab';
	this.privacy.style.display = 'block';

	this.terms.style.display = 'none';
	this.termsTab.className = 'tab inactive';
}

module.exports = Legal;