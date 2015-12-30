import React from 'react'
import ReactDOM from 'react-dom'
import TopBar from './../components/topbar'
import PostList from './../components/global/post-list'
import GallerySidebar from './../components/galleryDetail/gallery-sidebar'
import GalleryEdit from './../components/editing/gallery-edit'
import App from './app'

/**
 * Gallery Detail Parent Object, made of a side column and PostList
 */

class GalleryDetail extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			galleryEditToggled: false
		}

		this.toggleGalleryEdit = this.toggleGalleryEdit.bind(this);
	}

	toggleGalleryEdit() {
		this.setState({
			galleryEditToggled: !this.state.galleryEditToggled
		});
	}

	render() {

		console.log(this.state.galleryEditToggled);

		return (
			<App user={this.props.user}>
				<TopBar 
					title={this.props.title}
					editable={true}
					edit={this.toggleGalleryEdit}
					verifiedToggle={false}
					timeToggle={true}
					chronToggle={true} />
				<GallerySidebar gallery={this.props.gallery} />
				<div className="col-sm-8 tall">
					<PostList
						rank={this.props.user.rank}
						purchases={this.props.purchases}
						posts={this.props.gallery.posts}
						scrollable={false}
						editable={false}
						size='large' />
				</div>
				<GalleryEdit 
					gallery={this.props.gallery}
					toggle={this.toggleGalleryEdit}
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