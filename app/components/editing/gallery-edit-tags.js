import _ from 'lodash'
import React from 'react'
import Tag from './tag.js'

/**
 * Component for managing added/removed tags
 */

export default class GalleryEditTags extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			tags: this.props.tags
		}
		this.change = this.change.bind(this);
		this.handleClick = this.handleClick.bind(this);
	}

	render() {

		var tags = this.props.tags,
			tags = tags.map((tag, i) => {
				return (
					<Tag 
						onClick={this.handleClick.bind(null, tag)} 
						text={'#' + tag} 
						plus={false}
						key={i} />
				);
			});

		return (
			
			<div className="dialog-row split chips">
				<div className="split-cell">
					<input 
						id="gallery-tags-input" 
						type="text" 
						className="form-control floating-label" 
						placeholder="Tags"
						onKeyUp={this.change} />
					<ul ref="gallery-tags-list" className="chips">{tags}</ul>
				</div>
				<div className="split-cell">
					<span className="md-type-body2">Suggested tags</span>
 				</div>
			</div>

		);

	}

	/**
	 * Change handler for input field
	 * @param  {[type]} e [description]
	 * @return {[type]}   [description]
	 */
	change(e) {

		//Check if input is `Enter`
		if(e.keyCode != 13) return;

		var tag = e.target.value;

		e.target.value = '';
		
		if(this.props.tags.indexOf(tag) != -1) return;

		this.props.updateTags(this.props.tags.concat(tag));
	}

	/**
	 * Click event on a single tag dom element
	 */
	handleClick(tag) {
		
		var tags = this.props.tags,
			index = tags.indexOf(tag);

		if(index == -1) return;

		tags.splice(index, 1);

		this.props.updateTags(tags);
	}

}

GalleryEditTags.defaultProps = {
	updateTags: ()=>{}
}