import React from 'react'
import global from '../../../lib/global'

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
			url: '/api/story/recent',
			type: 'GET',
			data: {
				limit: 8
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
	 			<h3 className="md-type-button md-type-black-secondary">Recently Updated Stories</h3>
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
}
