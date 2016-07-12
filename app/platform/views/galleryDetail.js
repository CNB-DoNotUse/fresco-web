import React from 'react';
import ReactDOM from 'react-dom';
import TopBar from './../components/topbar';
import PostList from './../components/global/post-list';
import GallerySidebar from './../components/galleryDetail/gallery-sidebar';
import GalleryEdit from './../components/editing/gallery-edit';
import App from './app';
import utils from 'utils';

/**
 * Gallery Detail Parent Object, made of a side column and PostList
 */

class GalleryDetail extends React.Component {

	constructor(props) {
		super(props);

		// Check if every post in gallery is not verified and show all content
		let unverifiedPosts = this.props.gallery.posts.every(post => post.approvals == 0);

		this.state = {
			galleryEditToggled: false,
			gallery: this.props.gallery,
			shouldShowVerifiedToggle: unverifiedPosts,
			verifiedToggle: unverifiedPosts,
			title: this.props.title
		};

		this.toggleGalleryEdit = this.toggleGalleryEdit.bind(this);
		this.onVerifiedToggled = this.onVerifiedToggled.bind(this);
		this.updateGallery = this.updateGallery.bind(this);
	}

	toggleGalleryEdit() {
		this.setState({
			galleryEditToggled: !this.state.galleryEditToggled
		});
	}

    onVerifiedToggled(onlyVerified) {
        this.setState({ onlyVerified });
    }

	/**
	 * Updates gallery in state
	 */
	updateGallery(gallery){
		let title = 'Gallery';

		if(gallery.posts && gallery.posts[0].location && gallery.posts[0].location.address) {
			title += ' from ' + gallery.posts[0].location.address;
		}

		this.setState({
			gallery: gallery,
			title: title,
			updatePosts: true
		});
	}

    render() {
        const { user, purchases } = this.props;

        return (
            <App user={user}>
                <TopBar
                    title={this.state.title}
                    editable={user.rank >= utils.RANKS.CONTENT_MANAGER}
                    rank={user.rank}
                    edit={this.toggleGalleryEdit}
                    verifiedToggle={this.state.shouldShowVerifeidToggle}
                    onVerifiedToggled={this.onVerifiedToggled}
                    timeToggle={true}
                />

            <GallerySidebar gallery={this.state.gallery} />

            <div className="col-sm-8 tall">
                <PostList
                    rank={user.rank}
                    purchases={purchases}
                    parentCaption={this.state.gallery.caption}
                    posts={this.state.gallery.posts}
                    onlyVerified={this.state.onlyVerified}
                    updatePosts={this.state.updatePosts}
                    scrollable={false}
                    editable={false}
                    size='large'
                />
            </div>

            <GalleryEdit
                updateGallery={this.updateGallery}
                toggle={this.toggleGalleryEdit}
                gallery={this.state.gallery}
                toggled={this.state.galleryEditToggled}
            />
        </App>
        );
    }
}

GalleryDetail.defaultProps = {
	gallery: {}
}

ReactDOM.render(
	<GalleryDetail
		user={window.__initialProps__.user}
		purchases={window.__initialProps__.purchases}
		gallery={window.__initialProps__.gallery}
		title={window.__initialProps__.title} />,
	document.getElementById('app')
);

