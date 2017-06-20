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
import Recommend, { toggleRecommend } from 'app/platform/components/dialogs/recommend';

/**
 * Post Detail Parent Object, made of a side column and PostList
 */
class PostDetail extends React.Component {
    state = {
        galleryEditToggled: false,
        gallery: this.props.gallery,
        post: this.props.post,
    };

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
        const { gallery, galleryEditToggled, post, recommendToggled = false } = this.state;
        const editable = (user.admin) && !!gallery.id;
        const page = 'postDetail';
        return (
            <App
                user={user}
                page={page}>
                <TopBar
                    title={title}
                    editable={editable}
                    edit={() => this.toggleGalleryEdit()}
                    isPostDetail={true}
                    galleryRating={gallery.rating}
                    modalFunctions={[toggleRecommend.bind(this)]}
                />

                <div className="content">
                    <div className="row">
                        <div className="main">
                            <PostDetailImage post={post} user={user} page={page} />

                            <PostInfo
                                user={user}
                                post={post}
                                gallery={gallery}
                            />
                        </div>
                    </div>


                    <PostRelatedTags tags={gallery.tags} />
                </div>

                <GalleryEdit
                    gallery={gallery}
                    toggle={() => this.toggleGalleryEdit()}
                    visible={galleryEditToggled && editable}
                    onUpdateGallery={(g) => this.onUpdateGallery(g)}
                />
                <Recommend
                    toggle={toggleRecommend.bind(this)}
                    visible={recommendToggled}
                    onUpdateGallery={(g) => this.onUpdateGallery(g)}
                    gallery={gallery}
                    user={user}
                />
            </App>
        );
    }
}
// this used to go above PostRelatedTags, but unclear how this should be in phase 1 and 2
// <PostRelated gallery={gallery} />

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
        post={window.__initialProps__.post}
        title={window.__initialProps__.title}
    />,
    document.getElementById('app')
);
