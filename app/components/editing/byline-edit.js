var React = require('react');
	ReactDOM = require('react-dom');

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
						<div className="split-cell drop">
							<button className="toggle-drop md-type-subhead">
								<span className="gallery-byline-text">{byline}</span>
								<span className="mdi mdi-menu-down icon pull-right"></span>
							</button>
							<div className="drop-menu panel panel-default byline-drop">
								<div className="toggle-drop toggler md-type-subhead">
									<span className="gallery-byline-text">{post.meta.twitter.handle}</span>
									<span className="mdi mdi-menu-up icon pull-right"></span>
								</div>
								<div className="drop-body">
									<ul className="md-type-subhead" id="gallery-byline-twitter-options">
										<li className={'gallery-byline-type ' + (isHandleByline ? 'active' : '')}>
											{post.meta.twitter.handle}
										</li>
										<li className={'gallery-byline-type ' + (!isHandleByline ? 'active' : '')}>
											{post.meta.twitter.user_name}
										</li>
									</ul>
								</div>
							</div>
						</div>
						<div className="split-cell">
							<div className="form-control-wrapper">
								<input type="text" className="form-control" defaultValue={post.meta.other_origin.affiliation} id="gallery-twitter-affiliation-input" />
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