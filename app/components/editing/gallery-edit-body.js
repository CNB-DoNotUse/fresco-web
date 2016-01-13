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

		this.toggleHighlight = this.toggleHighlight.bind(this);
	}

	componentDidMount() {
		$.material.init();
	}

	toggleHighlight(e) {
		var gallery = this.props.gallery;
		if(e.target.checked) {
			gallery.visibility = 2;
		} else {
			gallery.visibility = 1;
		}
		this.props.updateGallery(gallery);
	}

	render() {

		var visibility = this.props.gallery.visibility;

		return (
			<div className="dialog-body">

				<div className="dialog-col col-xs-12 col-md-7 form-group-default">

					<BylineEdit gallery={this.props.gallery} />
					
					<div className="dialog-row">
										
						<textarea 
							id="gallery-edit-caption" 
							type="text" 
							className="form-control floating-label"
							ref="gallery-caption"
							value={this.props.gallery.caption}
							placeholder="Caption"
							onChange={this.props.updateCaption} />

					</div>
					
					<GalleryEditTags
						tags={this.props.gallery.tags} 
						updateTags={this.props.updateTags} />
					
					<GalleryEditStories 
						relatedStories={this.props.gallery.related_stories} 
						updateRelatedStories={this.props.updateRelatedStories} />
					
					<GalleryEditArticles
						articles={this.props.gallery.articles}
						updateArticles={this.props.updateArticles} />
					
					<div className="dialog-row">
						<div className="checkbox">
							<label>
								<input
									type="checkbox" 
									checked={this.props.gallery.visibility == 2}
									onChange={this.toggleHighlight} />
								<span className="ripple"></span>
								<span className="check"></span> Highlighted
							</label>
						</div>
					</div>

				</div>
				
				<GalleryEditPosts 
					posts={this.props.gallery.posts} 
					files={this.props.gallery.files}
					deletePosts={this.props.deletePosts}
					toggleDelete={this.props.toggleDeletePost} />
				
				<GalleryEditMap
					gallery={this.props.gallery}
					onPlaceChange={this.props.onPlaceChange} />

			</div>

		);
	}

}

GalleryEditBody.defaultProps = {
	deletePosts: 			[],
	onPlaceChange: 			function 	() { console.log('GalleryEditBody missing onPlaceChange prop') },
	toggleDeletePost: 		function	() { console.log('GalleryEditBody missing toggleDeletePost prop') },
	updateCaption: 			function 	() { console.log('GalleryEditBody missing updateCaption prop') },
	updateRelatedStories: 	function 	() { console.log('GalleryEditBody missing updateRelatedStories prop') },
	updateArticles: 		function 	() { console.log('GalleryEditBody missing updateArticles prop') },
	updateTags: 			function	() { console.log('GalleryEditBody missing updatedTags prop') }
}