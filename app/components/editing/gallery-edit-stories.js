import React from 'react'
import StoriesAutoComplete from './stories-autocomplete.js'

/**
 * Component for managing added/removed stories
 */

export default class GalleryEditStories extends React.Component {

	constructor(props)  {
		
		super(props);
		this.state = { stories: this.props.stories }
		this.addStory = this.addStory.bind(this);

	}

	componentWillReceiveProps(nextProps) {
		
		this.setState({ stories: nextProps.stories });
	
	}

	//Add's story element
	addStory(newStory) {

		this.props.updateRelatedStories(this.state.stories.concat(newStory));

	}

	handleClick(index) {

		var updatedStories = this.state.stories;

		//Remove from index
		updatedStories.splice(index, 1);

		this.props.updateRelatedStories(updatedStories);

	}

	render() {

		var stories = this.state.stories.map((story, i) => {

			return (

				<Tag 
					onClick={this.handleClick.bind(this, i)} 
					text={story.title} 
					plus={false}
					key={i} />

			)

		});

		return (

			<div className="dialog-row split chips">
				
				<div className="split-cell">
					<StoriesAutoComplete addStory={this.addStory} stories={this.state.stories} />
					<ul id="gallery-stories-list" className="chips">
						{stories}
					</ul>
				</div>
				
				<div className="split-cell">
					<span className="md-type-body2">Suggested stories</span>
					<ul id="gallery-suggested-stories-list" className="chips"></ul>
				</div>

			</div>

		);
	}
}