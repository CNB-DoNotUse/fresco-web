import React from 'react'
import ReactDOM from 'react-dom'
import App from './app'
import TopBar from './../components/topbar'
import StoryList from './../components/global/story-list'
import global from '../../lib/global'

/**
 * Stories Parent Object, contains StoryList composed of StoryCells
 */

class Stories extends React.Component {

	constructor(props) {
		super(props);
		this.loadStories = this.loadStories.bind(this);
	}

	render() {

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

	}

	//Returns array of posts with offset and callback, used in child PostList
	loadStories (passedOffset, callback) {

		var params = {
			limit: 10,
			verified : true,
			invalidate: 1,
			offset: passedOffset,
		};

		$.ajax({
			url:  '/api/story/recent?limit=24',
			type: 'GET',
			data: params,
			dataType: 'json',
			success: (response, status, xhr) => {

				//Do nothing, because of bad response
				if(!response.data || response.err)
					callback([]);
				else
					callback(response.data);

			},
			error: (xhr, status, error) => {
				$.snackbar({
					content:  'Couldn\'t fetch any stories!'
				});
			}

		});
	}

}

ReactDOM.render(
  <Stories user={window.__initialProps__.user} />,
  document.getElementById('app')
);
