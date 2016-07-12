import React from 'react'
import ReactDOM from 'react-dom'
import App from './app'
import TopBar from './../components/topbar'
import StoryList from './../components/global/story-list'
import utils from 'utils'

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

	/**
	 * Returns array of posts with offset and callback, used in child PostList	 
	 */
	loadStories (last, callback) {
		const params = {
            last,
			limit: 10
		};

		$.ajax({
			url:  '/api/story/recent',
			type: 'GET',
			data: params,
			dataType: 'json',
			success: (stories) => callback(stories),
			error: (xhr, status, error) => {
				$.snackbar({ content:  'Couldn\'t fetch any stories!' });
			}

		});
	}

}

ReactDOM.render(
  <Stories user={window.__initialProps__.user} />,
  document.getElementById('app')
);
