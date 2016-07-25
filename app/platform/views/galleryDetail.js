import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import TopBar from './../components/topbar';
import PostList from './../components/global/post-list';
import Sidebar from './../components/gallery/sidebar';
import Edit from './../components/gallery/edit';
import App from './app';
import utils from 'utils';

/**
 * Gallery Detail Parent Object, made of a side column and PostList
 */

class GalleryDetail extends React.Component {
    constructor(props) {
        super(props);

        // Check if every post in gallery is not verified and show all content
        const unverifiedPosts = props.gallery.posts.every(post => post.approvals == 0);

        this.state = {
            galleryEditToggled: false,
            gallery: props.gallery,
            shouldShowVerifiedToggle: unverifiedPosts,
            verifiedToggle: unverifiedPosts,
            title: props.title,
        };
    }

    onVerifiedToggled(onlyVerified) {
        this.setState({ onlyVerified });
    }

	/**
     * Updates gallery in state
     */
    onUpdateGallery(gallery) {
        let title = 'Gallery';

        if (gallery.posts && gallery.posts[0].location && gallery.posts[0].location.address) {
            title += ' from ' + gallery.posts[0].location.address;
        }

        this.setState({ gallery, title, updatePosts: true });
    }

    toggleGalleryEdit() {
        this.setState({ galleryEditToggled: !this.state.galleryEditToggled });
    }

    render() {
        const { user } = this.props;
        const {
            gallery,
            title,
            shouldShowVerifiedToggle,
            onlyVerified,
            updatePosts,
            galleryEditToggled,
        } = this.state;

        return (
            <App user={user}>
                <TopBar
                    title={title}
                    editable={user.rank >= utils.RANKS.CONTENT_MANAGER}
                    rank={user.rank}
                    edit={() => this.toggleGalleryEdit()}
                    verifiedToggle={shouldShowVerifiedToggle}
                    onVerifiedToggled={() => this.onVerifiedToggled()}
                    timeToggle
                />

                <Sidebar gallery={gallery} />

                <div className="col-sm-8 tall">
                    <PostList
                        rank={user.rank}
                        parentCaption={gallery.caption}
                        posts={gallery.posts}
                        onlyVerified={onlyVerified}
                        updatePosts={updatePosts}
                        scrollable={false}
                        editable={false}
                        size="large"
                    />
                </div>

                <Edit
                    onUpdateGallery={(g) => this.onUpdateGallery(g)}
                    toggle={() => this.toggleGalleryEdit()}
                    gallery={gallery}
                    toggled={galleryEditToggled}
                    user={user}
                />
            </App>
        );
    }
}

GalleryDetail.propTypes = {
    user: PropTypes.object,
    gallery: PropTypes.object,
    title: PropTypes.string,
};

GalleryDetail.defaultProps = {
    gallery: {},
};

ReactDOM.render(
    <GalleryDetail
        user={window.__initialProps__.user}
        gallery={window.__initialProps__.gallery}
        title={window.__initialProps__.title}
    />,
    document.getElementById('app')
);

