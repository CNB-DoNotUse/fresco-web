import React from 'react';

/** //

Description : Suggestion Column

// **/

/**
 * Suggestion List Parent Object
 */

export default class SuggestionList extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			stories: []
		}
	}

	componentDidMount() {

		$.ajax({
			url: API_URL + "/v1/story/recent",
			type: 'GET',
			data: {
				limit: 3
			},
			dataType: 'json',
			success: (response, status, xhr) => {

				//Do nothing, because of bad response
				if(!response.data || response.err) 
					return;
				
				//Set galleries from successful response
				this.setState({
					stories: response.data
				});
				
			},
			error: (xhr, status, error) => {
				$.snackbar({content: resolveError(error)});
			}
		});

	}

	render() {

		return (

			<div className="col-md-4">
	 			<h3 className="md-type-button md-type-black-secondary">Trending Stories</h3>
	 			<ul className="md-type-subhead trending-stories">
	 				{this.state.stories.map((story, i) => {
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