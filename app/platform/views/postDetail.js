import React from 'react';
import ReactDOM from 'react-dom';
import TopBar from './../components/topbar';
import App from './app';
import PostInfo from './../components/postDetail/post-info';
import PostRelated from './../components/postDetail/post-related';
import PostRelatedTags from './../components/postDetail/post-related-tags';
import PostDetailImage from './../components/postDetail/post-detail-image';
import GalleryEdit from './../components/editing/gallery-edit';
import utils from 'utils';

/**
 * Post Detail Parent Object, made of a side column and PostList
 */

class PostDetail extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            toggled: false,
            gallery: this.props.gallery,
            post: this.props.post,
        };

        this.hide = this.hide.bind(this);
        this.toggle = this.toggle.bind(this);
        this.updateGallery = this.updateGallery.bind(this);
    }

    hide() {
        this.setState({ toggled: false });
    }

    toggle() {
        this.setState({ toggled: !this.state.toggled });
    }

    updateGallery(gallery) {
        const post = this.state.post;

        if (gallery.visibility !== this.state.gallery.visibility) {
            post.approvals = gallery.visibility;
        }

        // Check if address is set, then update the post's address
        if (gallery.posts[0].location.address) {
            post.location.address = gallery.posts[0].location.address;
        }

        this.setState({ gallery, post });
    }

    render() {
        const { user, title, verifier } = this.props;
        const { gallery, toggled, post } = this.state;
        let editable = user.rank >= utils.RANKS.CONTENT_MANAGER && gallery.id;
        let galleryEdit = '';
        let relatedPosts = '';
        let relatedTags = '';

        if (editable) {
            galleryEdit = (
                <GalleryEdit
                    gallery={gallery}
                    toggled={toggled}
                    toggle={this.toggle}
                    updateGallery={this.updateGallery}
                    hide={this.hide}
                />
            );
        }

        relatedPosts = <PostRelated gallery={gallery} />;
        relatedTags = <PostRelatedTags tags={gallery.tags} />;

        return (
            <App user={user}>
                <TopBar
                    title={title}
                    editable={editable}
                    edit={this.toggle}
                />

                <div className="content">
                    <div className="row">
                        <div className="main">
                            <PostDetailImage
                                post={post}
                                user={user}
                            />

                            <PostInfo
                                user={user}
                                post={post}
                                gallery={gallery}
                                user={user}
                                verifier={verifier}
                            />
                        </div>
                    </div>
                    {relatedPosts}
                    {relatedTags}
                </div>

                {galleryEdit}
            </App>
        );
    }
}

PostDetail.defaultProps = {
    gallery: {},
};

ReactDOM.render(
    <PostDetail
        user={window.__initialProps__.user}
        gallery={window.__initialProps__.gallery}
        verifier={window.__initialProps__.verifier || ''}
        post={window.__initialProps__.post}
        title={window.__initialProps__.title}
    />,
    document.getElementById('app')
);
