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

		this.updateCaption = this.updateCaption.bind(this);
		this.updateRelatedStories = this.updateRelatedStories.bind(this);
		this.updateArticles = this.updateArticles.bind(this);
		this.updatedTags = this.updatedTags.bind(this);
		this.updatedLocation = this.updatedLocation.bind(this);
	}

	componentDidMount() {
	    $.material.init();
	}

	render() {

		var highlightCheckbox = (
			<div className="dialog-row">
				<div className="checkbox">
					<label>
						<input id="gallery-highlight-input" type="checkbox" />
						<span className="ripple"></span>
						<span className="check"></span> Highlighted
					</label>
				</div>
			</div>
		);

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
								ref="gallery-caption"
								defaultValue={this.props.gallery.caption}
								value={this.props.gallery.caption}
								onChange={this.updateCaption} />
							<div className="floating-label">Caption</div>
							<span className="material-input"></span>
						</div>

					</div>
					
					<GalleryEditTags ref='tags' tags={this.props.gallery.tags} updatedTags={this.updatedTags} />
					
					<GalleryEditStories 
						ref='stories'
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

	updateCaption() {

		var gallery = _.clone(this.props.gallery, true);
		gallery.caption = this.refs['gallery-caption'].value;

		this.props.updateGallery(gallery);

	}

	updateRelatedStories(updatedStories) {

		var gallery = _.clone(this.props.gallery, true);
		gallery.related_stories = updatedStories;

		this.props.updateGallery(gallery);

	}

	updateArticles(articles) {

		var gallery = _.clone(this.props.gallery, true)
			gallery.articles = articles;

		this.props.updateGallery(gallery);

	}

	updatedTags(tags) {

		var gallery = _.clone(this.props.gallery, true)
			gallery.tags = tags;

		this.props.updateGallery(gallery);

	}

	updatedLocation(location) {

		var gallery = _.clone(this.props.gallery, true);
			gallery.locations[0] = location;

		this.props.updateGallery(gallery);

	}

}