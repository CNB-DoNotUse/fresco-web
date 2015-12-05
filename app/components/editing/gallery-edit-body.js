import React from 'react'
import GalleryEditTags from './gallery-edit-tags'
import GalleryEditStories from './gallery-edit-stories'
import GalleryEditArticles from './gallery-edit-articles'
import GalleryEditPosts from './gallery-edit-posts'
import GalleryEditMap from './gallery-edit-map'
import BylineEdit from './byline-edit.js'

/**
 * Gallery Edit Body, inside of the GalleryEdit class
 * @description manages all of the input fields, and speaks to parent
 */

export default class GalleryEditBody extends React.Component {

	constructor(props) {
		super(props);
		this.updateRelatedStories = this.updateRelatedStories.bind(this);
		this.updateArticles = this.updateArticles.bind(this);
		this.updatedTags = this.updatedTags.bind(this);
		this.updatedLocation = this.updatedLocation.bind(this);
	}

	componentDidMount() {
	    $.material.init();
	}

	render() {

		var highlightCheckbox = '';

		//Check if the rank is valid for toggling the highlighted state
		if(this.props.user.rank && this.props.user.rank >= 1) {

			highlightCheckbox = <div className="dialog-row">
									<div className="checkbox">
										<label>
											<input id="gallery-highlight-input" type="checkbox" />
											<span className="ripple"></span>
											<span className="check"></span> Highlighted
										</label>
									</div>
								</div>

		}

		return (
			
			<div className="dialog-body">

				<div className="dialog-col col-xs-12 col-md-7 form-group-default">

					<BylineEdit gallery={this.props.gallery} />
					
					<div className="dialog-row">
										
						<div className="form-control-wrapper">
							<textarea 
								id="gallery-edit-caption" 
								type="text" 
								className="form-control" 
								defaultValue={this.props.gallery.caption} />
							<div className="floating-label">Caption</div>
							<span className="material-input"></span>
						</div>

					</div>
					
					<GalleryEditTags ref='tags' tags={this.props.gallery.tags} />
					
					<GalleryEditStories ref='stories' 
						stories={this.props.gallery.related_stories} 
						updateRelatedStories={this.updateRelatedStories} />
					
					<GalleryEditArticles ref='articles' articles={this.props.gallery.articles} />
					
					{highlightCheckbox}

				</div>
				
				<GalleryEditPosts posts={this.props.gallery.posts} files={this.props.gallery.files} />
				
				<GalleryEditMap gallery={this.props.gallery} />

			</div>

		);
	}

	updateRelatedStories(updatedStories) {

		this.props.gallery.related_stories = updatedStories;

		this.props.updateGallery(this.props.gallery);

	}

	updateArticles(articles) {

		this.props.gallery.articles = articles;

		this.props.updateGallery(this.props.gallery);

	}

	updatedTags(tags) {

		this.props.gallery.tags = tags;

		this.props.updateGallery(this.props.gallery);

	}

	updatedLocation(location) {

		this.props.gallery.locations[0] = location;

		this.props.updateGallery(this.props.gallery);

	}

}