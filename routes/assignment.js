var express = require('express'),
	config = require('../lib/config'),
	Assignment = require('../lib/assignment'),
	Gallery = require('../lib/gallery'),
	
	_ = require('underscore'),
	moment = require('moment'),
	request = require('request-json'),
	async = require('async'),
	
	router = express.Router(),
	api = request.createClient(config.API_URL);

router.get('/:id', function(req, res, next){
	if (!req.session || !req.session.user)
		return res.render('error', { user: req.session.user, error_code: 403, error_message: config.ERR_PAGE_MESSAGES[403] });
		
	var id = req.params.id;
	
	Assignment.get(id, function(err, assignment){
		if (err && _.isEmpty(assignment)) {
			req.session.alerts = [config.resolveError(err)];
			return req.session.save(function(){
				res.redirect(req.headers['Referer'] || config.DASH_HOME);
				res.end();
			});
		}
		
		if (req.session.user.rank >= config.RANKS.CONTENT_MANAGER){
			//Do nothing because you're a bossman
		}else if (req.session.user.outlet && req.session.user.outlet._id == assignment.outlet._id){
			assignment.posts = assignment.posts.filter(function(a){return a.approvals > 0;});
		}else{
			return res.render('error', { user: req.session.user, error_code: 403, error_message: config.ERR_PAGE_MESSAGES[403] });
		}
		
		if(assignment.expiration_time){
			var relative = moment(assignment.expiration_time, 'x').fromNow();
			if (assignment.expiration_time < Date.now())
				assignment.expires_text = "Expired " + relative;
			else
				assignment.expires_text = "Expires " + relative;	
		}
		else
			assignment.expires_text = "Never Expires";
			
		
		var purchases = null;
		if (req.session.user.outlet && req.session.user.outlet.verified){
			purchases = req.session.user.outlet.purchases || [];
			purchases = purchases.map(function(purchase){
				return purchase.post;
			});
		}
			
		assignment.created_text = moment(assignment.time_created, 'x').format('MMMM Do YYYY, h:mm a');
		res.render('assignment', { user: req.session.user, config: config, assignment: assignment, posts: assignment.posts || [], purchases: purchases, alerts: req.alerts, type: 'assignment' });
	});
});

module.exports = router;