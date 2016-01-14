var slick = {

	/**
	 * Loads highlights and intiailizes slick
	 */
	loadHighlights: function(){
		
		$.ajax({
			url: "/api/gallery/highlights",
			dataType: "JSON",
			type: "GET",
			success: function(response) {
				
				var count = 0,
					slickHighlights = document.getElementById('slick-highlights'),
					highlights = response.data;	// this is to make sure all articles have been output to the DOM before starting slick

				for (var i = 0; i < highlights.length; i++) {
					
					slickHighlights.innerHTML += slick.createGalleryView(highlights[i]);

				}

				slick.initSlick();
				highlightsLoaded = true;
			},
			error: function(xhr, status, err) {
				console.error(status, err.toString());
			}
			
		}); // end ajax
	},

	/**
	 * Start Slick on large screens
	 * Large version uses swipe: false on .articles
	 * and autoplay: true on .media
	 */
	initSlick: function() {
		
		$('#slick-highlights').slick({	// outter carousel (articles)
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
	},

	/**
	 * Creates gallery view for slick slider
	 * @param  {object} gallery Gallery for view
	 * @return {string}	HTML element
	 */
	createGalleryView: function(gallery){
		
		var posts = gallery.posts.map(function(post){

			var defaultAvatar = 'https://d1dw1p6sgigznj.cloudfront.net/images/user-1.png';
				avatar = post.owner ? post.owner.avatar ? post.owner.avatar : defaultAvatar :defaultAvatar,
				address = post.location.address != null ? post.location.address : 'No location',
				timestampText = moment(post.time_created).format('h:mm A'),
				byline = post.byline.replace('via Fresco News', ''),
				link = 'https://fresconews.com/gallery/' + gallery._id;
				
			return '<div class="post-slide" style="background-image:url('+ post.image +')">\
			            <table class="slick-meta">\
			                <tbody>\
			                    <tr class="user">\
			                        <td>\
			                            <img src="https://d1dw1p6sgigznj.cloudfront.net/images/user-1.png" />\
			                        </td>\
			                        <td class="meta-text byline">' + byline + '</td>\
			                    </tr>\
			                    \
			                    <tr>\
			                        <td><span class="mdi mdi-map-marker"></span></td>\
			                        <td class="meta-text">' + address +'</td>\
			                    </tr>\
			                    \
			                    <tr>\
			                        <td><span class="mdi mdi-clock"></span></td>\
			                        <td class="meta-text">' + timestampText + '</td>\
			                    </tr>\
			                </tbody>\
			            </table>\
			        </div>';

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

	},

	facebookClicked: function(e){

		var link = encodeURIComponent(e.target.dataset.link),
			facebook = 'https://www.facebook.com/dialog/share?app_id=267157383448416&display=popup&href='+ link +'&redirect_uri=' + encodeURIComponent('https://fresconews.com');

		var win = window.open(facebook, '_blank');

		if(win){
		    //Browser has allowed it to be opened
		    win.focus();
		}else{
		    //Broswer has blocked it
		    alert('Please allow popups for this site');
		}

	},

	twitterClicked: function() {
	},

	copyClicked: function() {
	},

	updateArrows: function(){
		var highlights = document.getElementById('_highlights'),
			slickHighlights = document.getElementById('slick-highlights'),
			arrowLeft = document.getElementById('arrow-left');

		//Desktop
		if(window.innerWidth > screen.mobile){
			highlights.insertBefore(arrowLeft, slickHighlights);
		}
		//Mobile
		else if(window.innerWidth < screen.mobile){
			highlights.insertBefore(slickHighlights, arrowLeft);
		}


	}

}