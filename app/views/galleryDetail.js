import React from 'react';
import ReactDOM from 'react-dom';
import TopBar from './../components/topbar';
import PostList from './../components/global/post-list';
import GallerySidebar from './../components/galleryDetail/gallery-sidebar';
import GalleryEdit from './../components/editing/gallery-edit';
import App from './app';
import global from '../../lib/global';

/**
 * Gallery Detail Parent Object, made of a side column and PostList
 */

class GalleryDetail extends React.Component {

	constructor(props) {
		super(props);

		var unverifiedPosts = false;

        // this is dirty but hard to deal with confusing api models any other way...
        // PostList expects the posts to come from post/list or post/:id which returns .parent
        props.gallery.posts.forEach(p => {
            p.unverifiedPosts = p.approvals == 0;
            p.parent = props.gallery;
        });

		this.state = {
			galleryEditToggled: false,
			gallery: this.props.gallery,
			shouldShowVerifeidToggle: unverifiedPosts,
			verifiedToggle: unverifiedPosts,
			sort: this.props.sort || 'created_at',
			title: this.props.title
		};

		this.toggleGalleryEdit = this.toggleGalleryEdit.bind(this);
		this.onVerifiedToggled = this.onVerifiedToggled.bind(this);
		this.updateGallery = this.updateGallery.bind(this);
		this.updateSort = this.updateSort.bind(this);
	}

	toggleGalleryEdit() {
		this.setState({
			galleryEditToggled: !this.state.galleryEditToggled
		});
	}

    onVerifiedToggled(verifiedToggle) {
        this.setState({ verifiedToggle });
    }

	/**
	 * Updates gallery in state
	 */
	updateGallery(gallery){
		var title = 'Gallery';

		if(gallery.posts && gallery.posts[0].location && gallery.posts[0].location.address) {
			title += ' from ' + gallery.posts[0].location.address;
		}

		this.setState({
			gallery: gallery,
			title: title,
			updatePosts: true
		});
	}

	updateSort(sort) {
		this.setState({ sort });
	}

    render() {
        const { user, purchases } = this.props;

        return (
            <App user={user}>
                <TopBar
                    title={this.state.title}
                    updateSort={this.updateSort}
                    editable={user.rank >= global.RANKS.CONTENT_MANAGER}
                    rank={user.rank}
                    edit={this.toggleGalleryEdit}
                    verifiedToggle={this.state.shouldShowVerifeidToggle}
                    onVerifiedToggled={this.onVerifiedToggled}
                    timeToggle={true}
                    chronToggle={true}
                />

            <GallerySidebar gallery={this.state.gallery} />

            <div className="col-sm-8 tall">
                <PostList
                    rank={user.rank}
                    purchases={purchases}
                    posts={this.state.gallery.posts}
                    onlyVerified={this.state.verifiedToggle}
                    updatePosts={this.state.updatePosts}
                    scrollable={false}
                    sort={this.state.sort}
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
