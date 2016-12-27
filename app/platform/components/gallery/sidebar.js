import React from 'react';
import utils from 'utils';

/**
 * Gallery sidebar parent object
 * @description Column on the left of the posts grid on the gallery detail page
 */
const GallerySidebar = (props) => {
	return (
		<div className="col-sm-4 profile hidden-xs">
			<div className="container-fluid fat">
				<div className="col-sm-10 col-md-8 col-sm-offset-1 col-md-offset-2">
					<div className="meta">
						<div className="meta-description" id="gallery-description">{props.gallery.caption}</div>

						<GalleryStats {...props} />
					</div>
				</div>
			</div>
		</div>
	);
}

/**
 * Gallery stats inside the sidebar
 */
const GalleryStats = ({ 
	gallery, 
	onClickReposts,
	onClickLikes 
}) => {
	return (
		<div className="meta-list">
			<ul className="md-type-subhead">
				<Stat
					icon='mdi mdi-image icon'
					value={gallery.photo_count}
					name={'photo'} 
				/> 
				<Stat
					icon='mdi mdi-movie icon'
					value={gallery.video_count}
					name={'video'} 
				/>
				<Stat
					icon='mdi mdi-heart icon'
					value={gallery.likes}
					name={'like'}
					onClick={onClickLikes} 
				/>
				<Stat
					icon='mdi mdi-twitter-retweet icon'
					value={gallery.reposts}
					name={'repost'}
					onClick={onClickReposts}
				/> 
			</ul>
		</div>
	);
}

/**
 * Individual statistic component
 */
const Stat = ({ value, name, icon, onClick = null }) => {
	return (
		<li onClick={onClick} style={{ cursor: onClick ? 'pointer' : null }}>
			<span className={icon}></span>
			<span>{value || 0} {utils.isPlural(value) ? `${name}s` : name}</span>
		</li>
	)
}


export default GallerySidebar;