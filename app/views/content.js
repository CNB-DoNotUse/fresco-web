var isNode = require('detect-node'),
	React = require('react'),
	ReactDOM = require('react-dom'),
	PostList = require('./../components/post-list.js'),
	TopBar = require('./../components/topbar.js'),
	App = require('./app.js');

/** //

Description : View page for content

// **/

/**
 * Content Parent Object (composed of PostList and Navbar)
 */

var Content = React.createClass({

	displayName: 'Content',

	getDefaultProps: function(){
		return {
			purchases : []
		};
	},

	render: function(){

		return (
			<App user={this.props.user}>
				<TopBar 
					title={this.props.title}
					timeToggle={true}
					verifiedToggle={true}
					chronToggle={true} />
				<PostList
					loadPosts={this.loadPosts}
					rank={this.props.user.rank}
					purchases={this.props.purchases}
					size='small'
					scrollabe={true} />
			</App>
		);

	},

	//Returns array of posts with offset and callback, used in child PostList
	loadPosts: function(passedOffset, callback){

		var endpoint = '/v1/post/list',
				params = {
					limit: 14,
					verified : true,
					offset: passedOffset
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

	module.exports = Content;

}
else{

	ReactDOM.render(
	 	<Content 
	 		user={window.__initialProps__.user} 
	 		purchases={window.__initialProps__.purchases}
	 		title={window.__initialProps__.title} />,
		document.getElementById('app')
	);

}
