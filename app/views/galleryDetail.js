import React from 'react'
import ReactDOM from 'react-dom'
import TopBar from './../components/topbar'
import PostList from './../components/global/post-list'
import GallerySidebar from './../components/galleryDetail/gallery-sidebar'
import GalleryEdit from './../components/editing/gallery-edit'
import App from './app'
import global from '../../lib/global'

/**
 * Gallery Detail Parent Object, made of a side column and PostList
 */

class GalleryDetail extends React.Component {

	constructor(props) {
		super(props);

		var verifiedCount = 0;

		// Check if every post in gallery is not verified and show all content
		for(var p in this.props.gallery.posts) {
			verifiedCount += this.props.gallery.posts[p].approvals;
		}

		this.state = {
			galleryEditToggled: false,
			gallery: this.props.gallery,
			verifiedToggle: verifiedCount > 0
		}

		this.toggleGalleryEdit = this.toggleGalleryEdit.bind(this);
		this.verifiedToggled = this.verifiedToggled.bind(this);
		this.updateGallery = this.updateGallery.bind(this);
	}

	toggleGalleryEdit() {
		this.setState({
			galleryEditToggled: !this.state.galleryEditToggled
		});
	}

	verifiedToggled(verifiedToggle) {
		this.setState({
			verifiedToggle: verifiedToggle
		});
	}

	/**
	 * Updates gallery in state
	 */
	updateGallery(gallery){
		this.setState({
			gallery: gallery
		});
	}

	render() {

		return (
			<App user={this.props.user}>
				<TopBar 
					title={this.props.title}
					editable={this.props.user.rank >= global.RANKS.CONTENT_MANAGER}
					edit={this.toggleGalleryEdit}
					verifiedToggle={true}
					onVerifiedToggled={this.verifiedToggled}
					defaultVerified={this.state.onlyVerified ? null : 'all'}
					timeToggle={true}
					chronToggle={true} />
				
				<GallerySidebar gallery={this.state.gallery} />
				
				<div className="col-sm-8 tall">
					<PostList
						rank={this.props.user.rank}
						purchases={this.props.purchases}
						posts={this.state.gallery.posts}
						onlyVerified={this.state.verifiedToggle}
						scrollable={false}
						editable={false}
						size='large' />
				</div>
				
				<GalleryEdit 
					updateGallery={this.updateGallery}
					toggle={this.toggleGalleryEdit}

					gallery={this.state.gallery}
					toggled={this.state.galleryEditToggled} />
			</App>
		);

	}
 }

GalleryDetail.defaultProps = {
	gallery : {}
}

ReactDOM.render(
	<GalleryDetail 
		user={window.__initialProps__.user} 
		purchases={window.__initialProps__.purchases} 
		gallery={window.__initialProps__.gallery}
		title={window.__initialProps__.title} />,
	document.getElementById('app')
);