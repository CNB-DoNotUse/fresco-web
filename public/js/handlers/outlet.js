var PAGE_Outlet = {};

$(document).ready(function(){
	PAGE_Purchases.postsElem = $('#posts');
	
	$('.mdi-pencil').on('click', function(evt){
		window.location.assign('/outlet/settings');
	});
	
	$('.vault.vault-toggler').click(function(){
		$('.purchases').removeClass('toggled');
		$('.vault').addClass('toggled');
	});
	
	$('.purchases.purchases-toggler').click(function(){
		$('.vault').removeClass('toggled');
		$('.purchases').addClass('toggled');
	});
	
	PAGE_Purchases.loadVault();
});

/*
** Page function for loading initial data
*/
var PAGE_Purchases = {
	postsElem: null,
	
	
	loadVault: function(){
		$.ajax({
			url: "/scripts/outlet/purchases",
			type: 'GET',
			data: { id: PAGE_Outlet.outlet._id },
			dataType: 'json',
			success: function(result, status, xhr){
				var posts = result.data;
				
				for (var index in posts)
					PAGE_Purchases.postsElem.append(buildPost(posts[index], true, 'large'));
			},
			error: function(xhr, status, error){
				$.snackbar({content: resolveError(error)});
			}
		});
	},
	buildPurchaseListItem: function(purchase) {
		var post = purchase.post;
		var video = post.video != null;
		var assignmentText = '';
		if(purchase.assignment){
			assignmentText = '<div>' +
			'	<p class="md-type-body2 assignment-link">' + purchase.assignment.title + '</p>' +
			'	<p class="md-type-body1 assignment-location">' + (purchase.assignment.location.address || purchase.assignment.location.googlemaps) + '</p>' +
			'</div>';
		}
		var elem = $('<div class="list-item">' +
		'	<div>' +
		'		<img class="img-circle" src="' + formatImg(post.image, 'small') + '">' +
		'	</div>' +
		'	<div>' +
		'		<p class="md-type-body1">' + getTimeAgo(Date.now(), purchase.timestamp) + '</p>' +
		'	</div>' +
		'	<div>' +
		'		<p class="md-type-body1">' + (video ? 'Video' : 'Photo') + '</p>' +
		'	</div>' +
		'	<div class="flexy">' +
		'		<p class="md-type-body1">' + PAGE_Purchases.formatPrice(PAGE_Purchases.getPrice(purchase))  + '</p>' +
		'	</div>' + assignmentText +
		// '	<div>' +
		// '		<p class="md-type-body2 toggle-aradd toggler">Add an article</p>' +
		// '	</div>' +
		'</div>');
		elem.find('.assignment-link').click(function(){
			window.open('/assignment/' + purchase.assignment._id);
		});
		elem.click(function(){
			window.open('/post/' + post._id);
		});
		elem.find(".toggle-aradd.toggler").click(function() {
			ArAddDialog.ARADD_POST = post._id;
			ArAddDialog.araddUpdate();
			$(".toggle-aradd").toggleClass("toggled");
		});
		return elem;
	},
	formatPrice: function(price){
		return '$' + (price / 100).toFixed(2);
	},
	getPrice: function(purchase){
		var post = purchase.post;
		var video = post.video != null;
		return video ? PAGE_Purchases.PRICE_VIDEO : PAGE_Purchases.PRICE_IMAGE;
	},
	emailStatement: function(){
		$.ajax({
			url: '/scripts/outlet/export/email',
			type: 'GET',
			dataType: 'json',
			success: function(result, status, xhr){
				if (result.err) {
					return $.snackbar({content: resolveError(result.err)});
				}
				$.snackbar({content: 'Email Sent'});
			},
			error: function(xhr, status, error){
				$.snackbar({content: resolveError(error)});
			}
		})
	}
}

var ArAddDialog = {
	otherArticles: [],
	galleryId: '',
	ARADD_POST: '',
	araddUpdate: function(){
		if(!ArAddDialog.ARADD_POST) return;
		$.ajax({
			url: "/scripts/post/gallery",
			type: 'GET',
			data: { id: ArAddDialog.ARADD_POST },
			dataType: 'json',
			success: function(result, status, xhr){
				if(result.err)
					return this.error(null, null, result.err);
				
				ArAddDialog.galleryId = result.data._id;
				
				$('#aradd-articles-list').empty();
				result.data.articles.forEach(function(article){
					if(!article.outlet || article.outlet._id != PAGE_Purchases.outlet._id){
						ArAddDialog.otherArticles.push(article._id);
						return;
					}
					var elem = makeTag(article.link);
					elem.data('id', article._id);
					$('#aradd-articles-list').append(elem);
				});
			},
			error: function(xhr, status, error){
				$.snackbar({content: resolveError(error)});
			}
		});
	},
	araddClear: function(){
		$('#aradd-articles-input').val('').trigger('keyup');
		$('#aradd-articles-list').empty();
	},
	araddSave: function(){
		var params = {
			id: ArAddDialog.galleryId,
			articles: ArAddDialog.otherArticles.concat($('#aradd-articles-list li.chip').map(function(elem){return $(this).data('id')}).toArray()),
		};
		$.ajax("/scripts/gallery/update", {
			method: 'post',
			contentType: "application/json",
			data: JSON.stringify(params),
			success: function(result){
				if(result.err){
					return this.error(null, null, result.err);
				}
				
				window.location.reload();
			},
			error: function(xhr, status, error){
				$.snackbar({content: resolveError(error)});
			}
		});
	}
};

$(document).ready(function(){
	$('#aradd-revert-button').click(ArAddDialog.araddUpdate);
	$('#aradd-clear-button').click(ArAddDialog.araddClear);
	$('#aradd-discard-button').click(ArAddDialog.araddClear);
	$('#aradd-save-button').click(ArAddDialog.araddSave);
	
	$('#aradd-articles-input').on('keydown', function(ev){
		if(ev.keyCode == 13 && $(this).val() != ''){
			var elem = makeTag($(this).val());
			elem.data('id', 'NEW={"link":"' + $(this).val() + '"}');
			elem.addClass('new-story');
			$('#aradd-articles-list').append(elem);
			$(this).val('').trigger('keyup');
		}
	});
});

function loadPurchases(){
	$.ajax({
		url: "/scripts/outlet/purchases",
		type: 'GET',
		data: { id: PAGE_Purchases.outlet._id, details:'true' },
		dataType: 'json',
		success: function(result, status, xhr){
			var purchases = result.data.sort(function(a, b){ return b.timestamp - a.timestamp; });
			
			purchases.forEach(function(purchase){
				$('#purchase-list').append(PAGE_Purchases.buildPurchaseListItem(purchase));
			});
			
			//Past Month
			var pastMonth = purchases.filter(function(purchase){
				return Date.now() - purchase.timestamp <= 2592000000;
			});
			var pastMonthTotal = pastMonth.reduce(function(prev, current){return prev + PAGE_Purchases.getPrice(current);}, 0)
			$('#past-month').text(PAGE_Purchases.formatPrice(pastMonthTotal));
			
			//Past Week
			var pastWeek = purchases.filter(function(purchase){
				return Date.now() - purchase.timestamp <= 604800000;
			});
			var pastWeekTotal = pastWeek.reduce(function(prev, current){return prev + PAGE_Purchases.getPrice(current);}, 0)
			$('#past-week').text(PAGE_Purchases.formatPrice(pastWeekTotal));
			
			//Past Day
			var pastDay = purchases.filter(function(purchase){
				return Date.now() - purchase.timestamp <= 86400000;
			});
			var pastDayTotal = pastDay.reduce(function(prev, current){return prev + PAGE_Purchases.getPrice(current);}, 0)
			$('#past-day').text(PAGE_Purchases.formatPrice(pastDayTotal));
		},
		error: function(xhr, status, error){
			$.snackbar({content: resolveError(error)});
		}
	});

}

$(document).ready(function(){
	loadPurchases();
	$('#email-statement-button').click(PAGE_Purchases.emailStatement);
});