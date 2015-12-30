import _ from 'lodash'
import React from 'react'
import Tag from './tag'
import global from '../../../lib/global'

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

		if(global.isEmptyString(newStory.title)) return;

		//Clear the input field
		this.refs.autocomplete.value = ''
		this.refs.dropdown.style.display = 'none';

		var stories = this.props.relatedStories;

		//Check if story already exists
		for(var s in stories) {
			if(stories[s]._id && stories[s]._id == newStory._id)
				return;
		}
		
		stories.push(newStory);

		this.props.updateRelatedStories(stories);
	}

	/**
	 * Removes story and updates to parent
	 */
	removeStory(index) {
		var relatedStories = this.props.relatedStories;
			//Remove from index
			relatedStories.splice(index, 1);
		
		this.props.updateRelatedStories(relatedStories);
	}

	change(e) {

		//Current fields input
		var query = this.refs.autocomplete.value;

		//Enter is pressed, and query is present
		if(e.keyCode == 13 && query.length > 0){

			this.addStory({
				title: query,
				new: true
			});

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
		
			return <li onClick={this.addStory.bind(null, story)}
						key={i}>{story.title}</li>
		
		});

		return (

			<div className="dialog-row split chips">
				<div className="split-cell">
					<input 
						type="text" 
						className="form-control floating-label" 
						placeholder="Stories"
						onKeyUp={this.change}
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