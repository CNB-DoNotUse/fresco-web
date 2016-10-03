import React from 'react';
import utils from 'utils';

/**
 * Gallery sidebar parent object
 * @description Column on the left of the posts grid on the gallery detail page
 */
const GallerySidebar = ({ gallery }) => {
	console.log(gallery);
	return (
		<div className="col-sm-4 profile hidden-xs">
			<div className="container-fluid fat">
				<div className="col-sm-10 col-md-8 col-sm-offset-1 col-md-offset-2">
					<div className="meta">
						<div className="meta-description" id="gallery-description">{gallery.caption}</div>

						<GalleryStats photo_count={gallery.photo_count} video_count={gallery.video_count} />
					</div>
				</div>
			</div>
		</div>
	);
}

/**
 * Gallery stats inside the sidebar
 */
const GalleryStats = ({ photo_count, video_count }) => {
	return (
		<div className="meta-list">
			<ul className="md-type-subhead">
				<li>
					<span className="mdi mdi-image icon"></span>
					<span>{photo_count || 0} {utils.isPlural(photo_count) ? 'photos' : 'photo'}</span>
				</li>
				<li>
					<span className="mdi mdi-movie icon"></span>
					<span>{video_count || 0} {utils.isPlural(photo_count) ? 'videos' : 'video'}</span>
				</li>
			</ul>
		</div>
	);
}


export default GallerySidebar;