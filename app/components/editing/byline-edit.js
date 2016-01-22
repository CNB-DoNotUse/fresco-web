import React from 'react'
import Dropdown from './../global/dropdown.js'

/**
 * Component for managing byline editing
 * @param {object} gallery Gallery object to base byline representation off of
 */

export default class GalleryEditByline extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			name: this.isTwitterImport() ? this.props.gallery.posts[0].meta.twitter.handle : ''
		}

		this.isTwitterImport = this.isTwitterImport.bind(this);
		this.handleSelected = this.handleSelected.bind(this);
	}

	isTwitterImport() {

		var post = this.props.gallery.posts[0];

		return post.imported && post.meta && post.meta.twitter;
		
	}

	handleSelected(selected) {
		this.setState({
			name: selected
		});
	}

	componentDidUpdate(prevProps, prevState) {
		if(this.props.gallery._id != prevProps.gallery._id) {
			var post = this.props.gallery.posts[0];

			if(this.isTwitterImport()) {
				this.setState({
					name: post.meta.twitter.handle
				});
			} else {

				if(this.refs.byline)
					this.refs.byline.value = post.byline;

				this.setState({
					name: ''
				});
			}
		}
	}

	/**
	 * Renders byline field
	 * @description Three types of instances for the byline
	 */
	render() {


		var gallery = this.props.gallery,
			post 	= gallery.posts[0],
			shouldBeHidden = false;

		var postIdOccurances = {};

		// Loop through gallery posts
		for(var p in gallery.posts) {
			// Assign each parent as key in object.
			postIdOccurances[gallery.posts[p].parent] = 1;

			// If there is more than one parent, hide.
			if(Object.keys(postIdOccurances).length > 1) {
				shouldBeHidden = true;
				break;
			}
		}

		if(shouldBeHidden) {
			return <div></div>;
		}

		//If the post contains twitter info, show twitter byline editor
		if (this.isTwitterImport()) {

			var isHandleByline = post.byline.indexOf('@') == 0,
				byline = isHandleByline ? post.meta.twitter.handle : post.meta.twitter.user_name,
				affiliation = post.meta.other_origin ? post.meta.other_origin.affiliation : '';

			return (

				<div className="dialog-row" ref="byline-parent" id="byline-edit">
					<div className="split byline-section" id="gallery-byline-twitter">
						<Dropdown
							options={[post.meta.twitter.handle, post.meta.twitter.user_name]}
							selected={byline}
							onSelected={this.handleSelected} />
						<input type="hidden" ref="name" value={this.state.name} />
						<div className="split-cell">
							<div className="form-control-wrapper">
								<input 
									type="text" 
									className="form-control" 
									defaultValue={affiliation} 
									ref="affiliation"
									id="gallery-edit-affiliation" />
								
								<div className="floating-label">Affiliation</div>
								
								<span className="material-input"></span>
							</div>
						</div>
					</div>
				</div>
			);

		}
		//If the post doesn't have an owner, but has a curator i.e. manually imported
		else if(!post.owner && post.curator) {

			var name = '',
				affiliation = '';

			if (post.meta.other_origin) {
				name = post.meta.other_origin.name;
				affiliation = post.meta.other_origin.affiliation;
			}
			
			return (
				<div className="dialog-row" id="byline-edit">
					<div className="split byline-section" id="gallery-byline-other-origin">
						<div className="split-cell" id="gallery-name-span">
							<div className="form-control-wrapper">
								<input 
									type="text" 
									className="form-control empty" 
									defaultValue={name} 
									ref="name"
									id="gallery-edit-name" />
								
								<div className="floating-label">Name</div>
								
								<span className="material-input"></span>
							</div>
						</div>
						
						<div className="split-cell">
							<div className="form-control-wrapper">
								<input 
									type="text" 
									className="form-control empty" 
									defaultValue={affiliation} 
									ref="affiliation"
									id="gallery-edit-affiliation" />
								
								<div className="floating-label">Affiliation</div>
								
								<span className="material-input"></span>
							</div>
						</div>
					</div>
				</div>
			);

		}
		//If organically submitted content i.e. user submitted the gallery, can't change the byline
		else {

			return (
				<div className="dialog-row" id="byline-edit">
					<span className="byline-section" id="gallery-byline-span">
						<div className="form-control-wrapper">
							<input 
								id="gallery-byline-input" 
								ref="byline"
								defaultValue={post.byline} 
								type="text" 
								className="form-control" 
								disabled={true} />
							
							<div className="floating-label">Byline</div>
							
							<span className="material-input"></span>
						</div>
					</span>
				</div>
			);
		}

	}

}