import moment from 'moment';
import utils from 'utils';
require('script!slick-carousel/slick/slick.min.js');

/**
 * Slick object contrusctor
 */
let Slick = function(screen){
	this.screen = screen;
	this.highlights = document.getElementById('_highlights');
	this.slickHighlights = document.getElementById('slick-highlights');
	this.arrowLeft = document.getElementById('arrow-left');
	this.highlightsLoaded = false;
}

/**
 * Loads highlights and intiailizes slick
 */
Slick.prototype.loadHighlights = function(callback) {
	//Check if already loaded
	if(this.highlightsLoaded) return;

	$.ajax({
		url: "/api/gallery/highlights?limit=5",
		dataType: "JSON",
		type: "GET",
		success: (response) => {
			if(typeof(response) === 'undefined' || response.length == 0)
				return;

			for (let i = 0; i < response.length; i++) {
				this.slickHighlights.innerHTML += this.createGalleryView(response[i]);
			}

			this.init();
			this.highlightsLoaded = true;
		},
		error: (xhr, status, err) => {
			if(callback) callback();
			console.error(status, err.toString());
		}
	});
}

/**
 * Start Slick on large screens
 * Large version uses swipe: false on .articles
 * and autoplay: true on .media
 */
Slick.prototype.init = function() {
	$(this.slickHighlights).slick({	// outter carousel (articles)
		arrows: false,
		swipe: false,
	});

	$('.highlight-inner-posts').slick({	// inner carousel (images)
		arrows: false,
		autoplay: false,
		dots: true
	});

	var arrowRight = document.getElementById('arrow-right'),
		arrowLeft =  document.getElementById('arrow-left'),
		links = document.getElementsByClassName('copy-link'),
		facebook = document.getElementsByClassName('facebook-link'),
		twitter = document.getElementsByClassName('twitter-link');

	for (var i = 0; i < links.length; i++) {
		links[i].addEventListener('click', this.copyClicked);
	};
	for (var i = 0; i < facebook.length; i++) {
		facebook[i].addEventListener('click', this.facebookClicked);
	};
	for (var i = 0; i < twitter.length; i++) {
		twitter[i].addEventListener('click', this.twitterClicked);
	};

	arrowRight.addEventListener('click', function(){
		$('#slick-highlights').slick('slickNext');
	});

	arrowLeft.addEventListener('click', function(){
		$('#slick-highlights').slick('slickPrev');
	});	
}

/**
 * Creates gallery view for slick slider
 * @param  {object} gallery Gallery for view
 * @return {string}	HTML element
 */
Slick.prototype.createGalleryView = function(gallery) {
	const link = 'https://fresconews.com/gallery/' + gallery.id;

	let posts = gallery.posts.map((post) => {
		const defaultAvatar = 'https://d1dw1p6sgigznj.cloudfront.net/images/user-1.png';
		const avatar = post.owner && post.owner.avatar ? post.owner.avatar : defaultAvatar;
		const address = post.address != null ? post.address : 'No location';
		const timestampText = moment(post.time_created).format('h:mm A');

		return `<div class="post-slide" style="background-image:url('${post.image}')">
		            <table class="slick-meta">
		                <tbody>
		                    <tr class="user">
		                        <td class="avatar">
		                            <img src="${avatar}" />
		                        </td>
		                        <td class="byline">${utils.getBylineFromPost(post)}</td>
		                    </tr>
		                    
		                    <tr>
		                        <td><span class="mdi mdi-map-marker"></span></td>
		                        <td class="meta-text">${address}</td>
		                    </tr>
		                    
		                    <tr>
		                        <td><span class="mdi mdi-clock"></span></td>
		                        <td class="meta-text">${timestampText}</td>
		                    </tr>
		                </tbody>
		            </table>
		        </div>`;

	});

	return '<div class="gallery-slide">\
			    <div class="highlight-inner-posts posts" id="slick-posts">' + posts.join(" ") + '</div>\
			    \
			    <div class="gallery-info">\
			        <p>' + gallery.caption + '</p>\
			        \
			        <div class="interaction">\
			            <div class="link">\
			                <span class="mdi mdi-link-variant"></span>\
			                <span class="copy-link" data-link="' + link + '">Copy Link</span>\
			            </div>\
			           \
			            <div class="social">\
			                <a href="https://twitter.com/intent/tweet?text='+ encodeURIComponent(link) +'" target="_blank">\
			                	<span class="mdi mdi-twitter twitter-link"></span>\
			                </a>\
			                <a><span class="mdi mdi-facebook-box facebook-link"  data-link="' + link + '"></span></a>\
			            </div>\
			        </div>\
			    </div>\
			</div>';
};

Slick.prototype.facebookClicked = function(e) {
	var link = encodeURIComponent(e.target.dataset.link),
		facebook = 'https://www.facebook.com/dialog/share?app_id=267157383448416&display=popup&href='+ link +'&redirect_uri=' + encodeURIComponent('https://fresconews.com');

	var win = window.open(facebook, '_blank');

	if(win){
	    //Browser has allowed it to be opened
	    win.focus();
	} else{
	    //Broswer has blocked it
	    alert('Please allow popups for this site');
	}
}

/**
 * Updates the slick arrows based on screen size
 */
Slick.prototype.updateArrows = function() {
	//Desktop
	if(window.innerWidth > this.screen.mobile){
		this.highlights.insertBefore(this.arrowLeft, this.slickHighlights);
	}
	//Mobile
	else if(window.innerWidth < this.screen.mobile){
		this.highlights.insertBefore(this.slickHighlights, this.arrowLeft);
	}
}

module.exports = Slick;
