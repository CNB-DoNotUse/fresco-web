import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import 'app/sass/platform/_posts';
import TopBar from './../components/topbar';
import App from './app';
import PostInfo from './../components/post/info';
import PostRelated from './../components/post/related';
import PostRelatedTags from './../components/post/related-tags';
import PostDetailImage from './../components/post/detail-image';
import GalleryEdit from './../components/gallery/edit';

/**
 * Post Detail Parent Object, made of a side column and PostList
 */
class PostDetail extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            galleryEditToggled: false,
            gallery: props.gallery,
            post: props.post,
        };
    }

    onUpdateGallery(gallery) {
        if (!gallery || !gallery.posts) return;
        const post = gallery.posts.find(p => p.id === this.state.post.id);
        this.setState({ gallery, post });
    }

    toggleGalleryEdit() {
        this.setState({ galleryEditToggled: !this.state.galleryEditToggled });
    }

    render() {
        const { user, title, verifier } = this.props;
        const { gallery, galleryEditToggled, post } = this.state;
        const editable = (user.permissions.includes('update-other-content')) && !!gallery.id;

        return (
            <App user={user}>
                <TopBar
                    title={title}
                    editable={editable}
                    edit={() => this.toggleGalleryEdit()}
                />

                <div className="content">
                    <div className="row">
                        <div className="main">
                            <PostDetailImage post={post} user={user} />

                            <PostInfo
                                user={user}
                                post={post}
                                gallery={gallery}
                                verifier={verifier}
                            />
                        </div>
                    </div>
                    
                    <PostRelated gallery={gallery} />
                    
                    <PostRelatedTags tags={gallery.tags} />
                </div>

                <GalleryEdit
                    gallery={gallery}
                    toggle={() => this.toggleGalleryEdit()}
                    visible={galleryEditToggled && editable}
                    onUpdateGallery={(g) => this.onUpdateGallery(g)}
                />
            </App>
        );
    }
}

PostDetail.propTypes = {
    user: PropTypes.object,
    gallery: PropTypes.object,
    post: PropTypes.object,
    title: PropTypes.string,
    verifier: PropTypes.string,
};

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

