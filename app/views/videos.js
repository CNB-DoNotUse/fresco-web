var isNode = require('detect-node'),
	React = require('react'),
	ReactDOM = require('react-dom'),
	PostList = require('./../components/post-list.js'),
	TopBar = require('./../components/topbar.js'),
	App = require('./app.js');

/**
 * Videos Parent Object (composed of Post and Navbar)
 */

var Videos = React.createClass({

	displayName: 'Videos',

	getDefaultProps: function(){
		return {
			purchases : []
		};
	},

	render: function(){

		return (
			<App user={this.props.user}>
				<TopBar 
					title="Photos"
					timeToggle={true}
					verifiedToggle={true}
					chronToggle={true} />
				<PostList
					loadPosts={this.loadPosts}
					rank={this.props.user.rank}
					purchases={this.props.purchases}
					size='small' />
			</App>
		);

	},

	//Returns array of posts with offset and callback, used in child PostList
	loadPosts: function(passedOffset, callback){

		var endpoint = '/v1/post/list',
				params = {
					limit: 14,
					verified : true,
					offset: passedOffset,
					type: 'video'
				};

		$.ajax({
			url:  API_URL + endpoint,
			type: 'GET',
			data: params,
			dataType: 'json',
			success: function(response, status, xhr){

				//Do nothing, because of bad response
				if(!response.data || response.err)
					callback([]);
				else
					callback(response.data);

			},
			error: function(xhr, status, error){
				$.snackbar({content: resolveError(error)});
			}

		});

	}

});

if(isNode){

	module.exports = Videos;

}
else{

	ReactDOM.render(
	 	<Videos 
	 		user={window.__initialProps__.user} 
	 		purchases={window.__initialProps__.purchases} />,
	 	document.getElementById('app')
	);

}
