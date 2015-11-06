/*
** Page function for loading initial data
*/
var PAGE_Purchases = {
	offset: 0,
	loading: false,
	unusedOutlets: [],
	usedOutlets: [],
	
	buildPurchaseListItem: function(purchase) {
		if(!purchase) return '';
		var post = purchase.purchase.post;
		var video = post.video != null;
		var assignmentText = '';
		if(purchase.purchase.assignment){
			assignmentText = '<div>' +
			'	<p class="md-type-body2 assignment-link">' + purchase.purchase.assignment.title + '</p>' +
			'	<p class="md-type-body1 assignment-location">' + (purchase.purchase.assignment.location.address || purchase.purchase.assignment.location.googlemaps) + '</p>' +
			'</div>';
		}
		var elem = $('<div class="list-item">' +
		'	<div>' +
		'		<img class="img-circle" src="' + formatImg(post.image, 'small') + '">' +
		'	</div>' +
		'	<div>' +
		'		<p class="md-type-body1">' + getTimeAgo(Date.now(), purchase.purchase.timestamp) + '</p>' +
		'	</div>' +
		'	<div>' +
		'		<p class="md-type-body1">' + (video ? 'Video' : 'Photo') + '</p>' +
		'	</div>' +
		'	<div class="flexy">' +
		'		<p class="md-type-body1">' + PAGE_Purchases.formatPrice(PAGE_Purchases.getPrice(purchase))  + '</p>' +
		'	</div>' + assignmentText +
		'	<div>' +
		'		<p class="md-type-body2 toggle-aradd toggler">' + purchase.title + '</p>' +
		'	</div>' +
		'</div>');
		elem.find('.assignment-link').click(function(){
			window.open('/assignment/' + purchase.purchase.assignment._id);
		});
		elem.click(function(){
			window.open('/post/' + post._id);
		});
		return elem;
	},
	formatPrice: function(price){
		return '$' + (price / 100).toFixed(2);
	},
	getPrice: function(purchase){
		if (!purchase) return '';
		var post = purchase.purchase.post;
		var video = post.video != null;
		return video ? PAGE_Purchases.PRICE_VIDEO : PAGE_Purchases.PRICE_IMAGE;
	},
	refreshPurchasesList: function(){
		PAGE_Purchases.offset = 0;
		PAGE_Purchases.loading = false;
		$('#purchase-list').empty();
		PAGE_Purchases.loadAllPurchases();
	},
	loadAllPurchases: function(){
		if(PAGE_Purchases.loading) return;
		PAGE_Purchases.loading = true;
		
		var params = {
			 limit: PAGE_Purchases.offset + 20,
			 offset: PAGE_Purchases.offset
		}
		
		if (PAGE_Purchases.usedOutlets.length > 0)
			params.outlets = PAGE_Purchases.usedOutlets.map(function(outlet){ return outlet._id});
		
		$.ajax({
			url: "/scripts/outlet/purchases/list",
			type: 'GET',
			data: params,
			dataType: 'json',
			success: function(result, status, xhr){
				PAGE_Purchases.loading = false;
				var purchases = result.data;
				
				PAGE_Purchases.offset += purchases.length;
				
				purchases.forEach(function(purchase){
					$('#purchase-list').append(PAGE_Purchases.buildPurchaseListItem(purchase));
				});
				
				//Past Month
				var pastMonth = purchases.filter(function(purchase){
					return Date.now() - purchase.purchase.timestamp <= 2592000000;
				});
				var pastMonthTotal = pastMonth.reduce(function(prev, current){return prev + PAGE_Purchases.getPrice(current);}, 0)
				$('#past-month').text(PAGE_Purchases.formatPrice(pastMonthTotal));
				
				//Past Week
				var pastWeek = purchases.filter(function(purchase){
					return Date.now() - purchase.purchase.timestamp <= 604800000;
				});
				var pastWeekTotal = pastWeek.reduce(function(prev, current){return prev + PAGE_Purchases.getPrice(current);}, 0)
				$('#past-week').text(PAGE_Purchases.formatPrice(pastWeekTotal));
				
				//Past Day
				var pastDay = purchases.filter(function(purchase){
					return Date.now() - purchase.purchase.timestamp <= 86400000;
				});
				var pastDayTotal = pastDay.reduce(function(prev, current){return prev + PAGE_Purchases.getPrice(current);}, 0)
				$('#past-day').text(PAGE_Purchases.formatPrice(pastDayTotal));
			},
			error: function(xhr, status, error){
				PAGE_Purchases.loading = false;
				$.snackbar({content: resolveError(error)});
			}
		});
	},
	loadAllOutlets: function(){
		$.ajax({
			url: '/scripts/outlet/list',
			type: 'GET',
			dataType: 'json',
			success: function(result, status, xhr){
				if(result.err)
					return this.error(null, null, result.err);
					
				PAGE_Purchases.unusedOutlets = result.data;
				PAGE_Purchases.updateOutletFilter();
			},
			error: function(xhr, status, error){
				$.snackbar({content: resolveError(error)});
			}
		})
	},
	updateOutletFilter: function(){
		$('#outlet-filter').empty();
		$('#outlet-filter-available').empty();
		PAGE_Purchases.usedOutlets.forEach(function(outlet, index){
			var elem = makeTag(outlet.title, false);
			elem.data('id', outlet._id);
			elem.click(function(){
				PAGE_Purchases.usedOutlets.splice(index, 1);
				PAGE_Purchases.unusedOutlets.push(outlet);
				PAGE_Purchases.updateOutletFilter();
				PAGE_Purchases.refreshPurchasesList();
			});
			$('#outlet-filter').append(elem);
		});
		
		if(PAGE_Purchases.usedOutlets.length > 0)
			$('.outlet-dropdown').text(PAGE_Purchases.usedOutlets.map(function(o){return o.title}).join(', '));
		else
			$('.outlet-dropdown').text('All outlets');
			
		PAGE_Purchases.unusedOutlets.forEach(function(outlet, index){
			var elem = makeTag(outlet.title, true);
			elem.data('id', outlet._id);
			elem.click(function(){
				PAGE_Purchases.unusedOutlets.splice(index, 1);
				PAGE_Purchases.usedOutlets.push(outlet);
				PAGE_Purchases.updateOutletFilter();
				PAGE_Purchases.refreshPurchasesList();
			});
			$('#outlet-filter-available').append(elem);
		});
	},
	downloadExports: function(format){
		var url = "/scripts/outlet/export?format=" + format + "&";
		 PAGE_Purchases.usedOutlets.forEach(function(outlet){
			url += 'outlets[]=' + outlet._id;
		});
		
		window.open(url, '_self');
	}
}

$(document).ready(function(){
	PAGE_Purchases.loadAllPurchases();
	PAGE_Purchases.loadAllOutlets();
	
	$('#outlet-filter-input').typeahead({
		hint: true,
		highlight: true,
		minLength: 1,
		classNames: {
			menu: 'tt-menu shadow-z-2',
			suggestion: 'article-suggestion'
		}
	},
	{
		name: 'outlets',
		display: 'title',
		source:function findMatches(q, cb) {
			var matches = [],
				substrRegex = new RegExp(q, 'i');
				
			var titles = PAGE_Purchases.unusedOutlets.map(function(outlet){return outlet.title});	
			$.each(titles, function(i, str) {
				if (substrRegex.test(str)) {
					matches.push(PAGE_Purchases.unusedOutlets[i]);
				}
			});
		
			cb(matches);
		},
		templates: {
			empty: [
				'<div class="article-empty-message tt-suggestion">',
					'No Outlets with that name',
				'</div>'
			].join('\n'),
		}
	}).on('typeahead:select', function(ev, outlet){
		var index = PAGE_Purchases.unusedOutlets.indexOf(outlet);
		PAGE_Purchases.unusedOutlets.splice(index, 1);
		PAGE_Purchases.usedOutlets.push(outlet);
		PAGE_Purchases.updateOutletFilter();
		PAGE_Purchases.refreshPurchasesList();
	});
	
	$('#purchase-list').scroll(function() {
		if(!PAGE_Purchases.loading && $('#purchase-list')[0].scrollHeight - $('#purchase-list').scrollTop() <= $('#purchase-list').height() + 64)
			PAGE_Purchases.loadAllPurchases();
	});
	
	$('#export-csv').click(function(){
		PAGE_Purchases.downloadExports('csv');
	});
	
	$('#export-xlsx').click(function(){
		PAGE_Purchases.downloadExports('xlsx');
	});
});