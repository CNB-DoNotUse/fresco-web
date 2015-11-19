var React = require('react');
	ReactDOM = require('react-dom'),
	Dropdown = require('./../global/dropdown.js');

/**
 * Component for managing byline editing
 * @param {object} gallery Gallery object to base byline representation off of
 */

var GalleryEditByline = React.createClass({

	displayName: 'GalleryEditByline',

	/**
	 * Renders byline field
	 * @description Three types of instances for the byline
	 */
	render: function(){

		var post = this.props.gallery.posts[0];

		//If the post contains twitter info, show twitter byline editor
		if (post.meta && post.meta.twitter) {

			var isHandleByline = post.byline.indexOf('@') == 0;

			if (isHandleByline)
				byline = post.meta.twitter.handle;
			else 
				byline = post.meta.twitter.user_name;

			return (

				<div className="dialog-row">
					<div className="split byline-section" id="gallery-byline-twitter">
						<Dropdown
							options={[post.meta.twitter.handle, post.meta.twitter.user_name]}
							selected={byline}
							onSelected={this.bylineSelected} />
						<div className="split-cell">
							<div className="form-control-wrapper">
								<input 
									type="text" 
									className="form-control" 
									defaultValue={post.meta.other_origin.affiliation} 
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
		else if(!post.owner && post.curator){

			var name = '',
				affiliation = '';

			if (post.meta.other_origin) {
				name = post.meta.other_origin.name;
				affiliation = post.meta.other_origin.affiliation;
			}
			
			return (
				<div className="dialog-row">
					<div className="split byline-section" id="gallery-byline-other-origin">
						<div className="split-cell" id="gallery-name-span">
							<div className="form-control-wrapper">
								<input type="text" className="form-control empty" defaultValue={name} id="gallery-edit-name" />
								<div className="floating-label">Name</div>
								<span className="material-input"></span>
							</div>
						</div>
						<div className="split-cell">
							<div className="form-control-wrapper">
								<input type="text" className="form-control empty" defaultValue={affiliation} id="gallery-edit-affiliation" />
								<div className="floating-label">Affiliation</div>
								<span className="material-input"></span>
							</div>
						</div>
					</div>
				</div>

			);

		}
		//If organically submitted content i.e. user submitted the gallery, can't change the byline
		else{
			return (
				<div className="dialog-row">
					<span className="byline-section" id="gallery-byline-span">
						<div className="form-control-wrapper">
							<input id="gallery-byline-input" defaultValue={post.byline} type="text" className="form-control" disabled={true} />
							<div className="floating-label">Byline</div>
							<span className="material-input"></span>
						</div>
					</span>
				</div>
			);
		}
	}

});


module.exports = GalleryEditByline;