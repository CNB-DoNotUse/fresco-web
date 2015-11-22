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

		this.handleClick = this.handleClick.bind(this);
	}

	componentWillReceiveProps(nextProps) {
		
		this.setState({
			tags: nextProps.tags
		})

	}

	render() {

		var tags = this.state.tags.map((tag, i) => {
			return (

				<Tag 
					onClick={this.handleClick.bind(this, i)} 
					text={'#' + tag} 
					plus={false}
					key={i} />

			)

		});

		return (
			
			<div className="dialog-row split chips">
				<div className="split-cell">
					<input 
						id="gallery-tags-input" 
						type="text" 
						className="form-control floating-label" 
						placeholder="Tags"
						onChange={this.change} />
					<ul ref="gallery-tags-list" className="chips">{tags}</ul>
				</div>
				<div className="split-cell">
					<span className="md-type-body2">Suggested tags</span>
					<ul id="gallery-suggested-tags-list" className="chips"></ul>
				</div>
			</div>

		);

	}

	handleClick(index) {

		var updatedTags = this.state.tags;

		//Remove from index
		updatedTags.splice(index, 1);

		//Update state
		this.setState({
			tags: updatedTags
		});

	}

}