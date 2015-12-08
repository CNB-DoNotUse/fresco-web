import React from 'react'
import Tag from './tag'
import StoriesAutoComplete from './stories-autocomplete.js'

/**
 * Component for managing added/removed stories
 */

export default class GalleryEditStories extends React.Component {

	constructor(props)  {
		
		super(props);
		this.addStory = this.addStory.bind(this);

	}

	componentWillReceiveProps(nextProps) {
		
		this.setState({ stories: nextProps.stories });
	
	}

	//Add's story element, return if story exists in prop stories.
	addStory(newStory) {
		var stories = this.props.stories;

		for( var s in stories ) {
			if(stories[s]._id == newStory._id) {
				return;
			}
		}

		this.props.addStory(newStory);

	}

	render() {
		/*onClick={this.props.removeStory.bind(null, story.title) */ 
		var stories = this.props.stories.map((story, i) => {
			return (
				<Tag 
					text={story.title} 
					plus={false}
					key={i} />
			)
		}, this);

		return (

			<div className="dialog-row split chips">
				
				<div className="split-cell">
					<StoriesAutoComplete addStory={this.addStory} />
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