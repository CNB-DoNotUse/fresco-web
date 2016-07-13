import _ from 'lodash'
import React from 'react'
import Tag from './tag.js'
import utils from 'utils'

/**
 * Component for managing added/removed tags
 */

export default class GalleryEditTags extends React.Component {

	constructor(props) {
		super(props);
		this.change = this.change.bind(this);
		this.removeTag = this.removeTag.bind(this);
	}

	change(e) {
		
		//Check if enter
		if(e.keyCode != 13) return;

		var tags = _.clone(this.props.tags, true),
			tag = e.target.value;

		if(utils.isEmptyString(tag)) return;

		e.target.value = '';
		
		//Check if tag exists
		if(tags.indexOf(tag) != -1) return;

		tags.push(tag);

		this.props.updateTags(tags);

	}

	/**
	 * Removes tag at passed index
	 */
	removeTag(index) {

		var tags = _.clone(this.props.tags, true);

		tags.splice(index, 1);
		
		this.props.updateTags(tags);
	}

	render() {

		var tags = this.props.tags.map((tag, i) => {
			return (
				<Tag 
					onClick={this.removeTag.bind(null, i)} 
					text={'#' + tag} 
					plus={false}
					key={i} />
			);
		});

		return (
			
			<div className="dialog-row split chips">
				<div className="split-cell">
					<input 
						type="text" 
						className="form-control floating-label" 
						placeholder="Tags"
						onKeyUp={this.change} />
					<ul ref="gallery-tags-list" className="chips">{tags}</ul>
				</div>
				<div className="split-cell">
					<span className="md-type-body2">Suggested Tags</span>
 				</div>
			</div>

		);

	}

}

GalleryEditTags.defaultProps = {
	tags: [],
	updateTags: () => {}
}