import _ from 'lodash'
import React from 'react'
import Tag from './tag'

/**
 * Component for managing added/removed stories
 */

export default class GalleryEditStories extends React.Component {

	constructor(props)  {
		super(props);
		this.state = {
			suggestions: []
		}
		this.addStory = this.addStory.bind(this);
		this.removeStory = this.removeStory.bind(this);
		this.change = this.change.bind(this);
	}

	/**
	 * Adds story element, return if story exists in prop stories.
	 */
	addStory(newStory) {

		//Clear the input field
		this.refs.autocomplete.value = ''
		this.refs.dropdown.style.display = 'none';

		var stories = this.props.relatedStories;

		//Check if story already exists
		for(var s in stories) {
			if(stories[s]._id == newStory._id) return;
		}
		
		stories.push(newStory);

		this.props.updateRelatedStories(stories);
	}

	/**
	 * Removes story and updates to parent
	 */
	removeStory(index) {
		//Remove from index
		var stores = this.props.relatedStories.splice(index, 1);

		this.props.updateRelatedStories(stories);
	}

	change(e) {

		//Current fields input
		var query = this.refs.autocomplete.value;

		//Enter is pressed
		if(e.keyCode == 13){

			this.addStory(query);

		} else{

			//Field is empty
			if(query.length == 0){
				this.setState({ suggestions: [] });
				this.refs.dropdown.style.display = 'none';
			} else{

				this.refs.dropdown.style.display = 'block';

				$.ajax({
					url: '/scripts/story/autocomplete',
					data: { q: query },
					success: (result, status, xhr) => {

						if(result.data){

							this.setState({ suggestions: result.data });
							
						}	
					}
				});
			}

		}
	}

	render() {
		
		//Map out related stories
		var stories = this.props.relatedStories.map((story, i) => {
			return (
				<Tag 
					text={story.title} 
					plus={false}
					onClick={this.removeStory.bind(null, i)}
					key={i} />
			)
		});

		//Map suggestions for dropdown
		var suggestions = this.state.suggestions.map((story, i) => {
		
			return <li  onClick={this.addStory.bind(null, story)}
						key={i}>{story.title}</li>
		
		});

		return (

			<div className="dialog-row split chips">
				<div className="split-cell">
					<input 
						type="text" 
						className="form-control" 
						placeholder="Stories"
						onChange={this.change}
						ref='autocomplete' />
					
					<ul ref="dropdown" className="dropdown">
						{suggestions}
					</ul>
					
					<ul className="chips">
						{stories}
					</ul>
				</div>
				
				<div className="split-cell">
					<span className="md-type-body2">Suggested Stories</span>
					
					<ul className="chips"></ul>
				</div>
			</div>

		);
	}
}

GalleryEditStories.defaultProps = {
	updateRelatedStories: () => {},
	relatedStories: []
}