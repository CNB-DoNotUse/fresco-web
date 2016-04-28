import React from 'react';

/** //

Description : Column on the left of the posts grid on the gallery detail page

// **/

/**
 * Gallery sidebar parent object
 */

export default class GallerySidebar extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {

		return (
			<div className="col-sm-4 profile hidden-xs">
				<div className="container-fluid fat">
					<div className="col-sm-10 col-md-8 col-sm-offset-1 col-md-offset-2">
						<div className="meta">
							<div className="meta-description" id="gallery-description">{this.props.gallery.caption}</div>
							
							<GalleryStats gallery={this.props.gallery} />
						</div>
					</div>
				</div>
			</div>

		);
	}

}

/**
 * Gallery stats inside the sidebar
 */

class GalleryStats extends React.Component {

	render() {

		if(!this.props.gallery.stats) return(
			<div className="meta-list"></div>
		);

		var photos = '',
			videos = '';

		if(this.props.gallery.stats.photos){
			photos = <li>
						<span className="mdi mdi-image icon"></span>
						<span>{this.props.gallery.stats.photos} {this.props.gallery.stats.photos > 1 ? 'photos' : 'photo'}</span>
					</li>
		}
		if(this.props.gallery.stats.videos){
			videos = <li>
						<span className="mdi mdi-movie icon"></span>
						{this.props.gallery.stats.videos + ' video'}
					</li>
		}

		return (

			<div className="meta-list">
				<ul className="md-type-subhead">
					{photos}
					{videos}
				</ul>
			</div>
			
		)
	}
}