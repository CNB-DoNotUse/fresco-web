var React = require('react');
var ReactDOM = require('react-dom');

/** //

Description : Suggestion Column

// **/

/**
 * Suggestion List Parent Object
 */

var SuggestionList = React.createClass({

	displayName: 'SuggestionList',

	getInitialState: function() {
		return {
			stories: []
		}
	},

	componentDidMount: function() {

		self = this;

		$.ajax({
			url: API_URL + "/v1/story/recent",
			type: 'GET',
			data: {
				limit: 3
			},
			dataType: 'json',
			success: function(response, status, xhr){

				//Do nothing, because of bad response
				if(!response.data || response.err) 
					return;
				
				//Set galleries from successful response
				self.setState({
					stories: response.data
				});
				
			},
			error: function(xhr, status, error){
				$.snackbar({content: resolveError(error)});
			}
		});

	},

	render: function(){

		return (

			<div className="col-md-4">
	 			<h3 className="md-type-button md-type-black-secondary">Trending Stories</h3>
	 			<ul className="md-type-subhead trending-stories">
	 				{this.state.stories.map(function (story, i) {
				      	return (
				        	<li key={i}>
				        		<a href={'/story/' + story._id}>{story.title}</a>
				        	</li>
				      	)
			  		})}
	 			</ul>
			</div>

		);
	}
});

module.exports = SuggestionList;