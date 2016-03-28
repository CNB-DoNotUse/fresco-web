(function(){
	window.setInterval(function() {
		$.get('/api/ping', function(data) {
			if(!data.pong) {
				window.location = '/account?next=' + window.location.pathname;
			}
		});
	}, 15000);
})();