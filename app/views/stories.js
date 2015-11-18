var isNode = require('detect-node'),
	React = require('react'),
	ReactDOM = require('react-dom'),
	TopBar = require('./../components/topbar.js'),
	StoryList = require('./../components/story-list.js')
	App = require('./app.js');

/**
 * Stories Parent Object, contains StoryList composed of StoryCells
 */

var Stories = React.createClass({

	displayName: 'Stories',

	render: function(){

		return (
			<App user={this.props.user}>
				<TopBar 
					title="Stories"
					timeToggle={true}
					tagToggle={true} />
				<StoryList 
					loadStories={this.loadStories}
					scrollable={true} />
			</App>
		);

	},

	//Returns array of posts with offset and callback, used in child PostList
	loadStories: function(passedOffset, callback){

		var endpoint = '/v1/post/list',
				params = {
					limit: 10,
					verified : true,
					invalidate: 1,
					offset: passedOffset,
				};

		$.ajax({
			url:  API_URL + '/v1/story/recent',
			type: 'GET',
			data: params,
			dataType: 'json',
			success: function(response, status, xhr){

				console.log(response);

				//Do nothing, because of bad response
				if(!response.data || response.err)
					callback([]);
				else
					callback(response.data);

			},
			error: function(xhr, status, error){
				$.snackbar({
					content:  'Couldn\'t fetch any stories!'
				});
			}

		});
	}

});

if(isNode){

	module.exports = Stories;

}
else{

	ReactDOM.render(
	  <Stories user={window.__initialProps__.user} />,
	  document.getElementById('app')
	);

}
