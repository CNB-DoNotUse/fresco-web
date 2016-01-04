var slick = {

	/**
	 * Loads highlights and intiailizes slick
	 */
	loadHighlights: function(){
		var self = this;
		
		$.ajax({
			url: "https://api.fresconews.com/v1/gallery/highlights",
			dataType: "JSON",
			type: "GET",
			success: function(response) {
				
				var count = 0,
					slickHighlights = document.getElementById('slick-highlights'),
					highlights = response.data;	// this is to make sure all articles have been output to the DOM before starting slick

				for (var i = 0; i < highlights.length; i++) {
					
					slickHighlights.innerHTML += slick.createGalleryView(highlights[i]);

				};

				self.initSlick();

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

		$('#slick-posts').slick({	// inner carousel (images)
			arrows: false,
			autoplay: false,
			dots: true
		});

		var arrowRight = document.getElementById('arrow-right'),
			arrowLeft =  document.getElementById('arrow-left');

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
				timestampText = moment(post.timestamp).format('h:mm:ss a, MMM Do YYYY');

			return '<div class="post-slide" style="background-image:url('+ post.image +')">\
			            <table class="slick-meta">\
			                <tbody>\
			                    <tr class="user">\
			                        <td>\
			                            <img src="https://d1dw1p6sgigznj.cloudfront.net/images/user-1.png" />\
			                        </td>\
			                        <td class="meta-text byline">' + post.byline + '</td>\
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
				    <div class="posts" id="slick-posts">' + posts.join(" ") + '</div>\
				    \
				    <div class="gallery-info">\
				        <p>' + gallery.caption + '</p>\
				        \
				        <div class="interaction">\
				            <div class="link">\
				                <span class="mdi mdi-link-variant"></span>\
				                <span>Copy Link</span>\
				            </div>\
				           \
				            <div class="social">\
				                <a><span class="mdi mdi-twitter"></span></a>\
				                <a><span class="mdi mdi-facebook-box"></span></a>\
				            </div>\
				        </div>\
				    </div>\
				</div>';

	}

}