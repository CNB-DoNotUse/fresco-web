import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import TopBar from './../components/topbar';
import App from './app';
import PostInfo from './../components/postDetail/post-info';
import PostRelated from './../components/postDetail/post-related';
import PostRelatedTags from './../components/postDetail/post-related-tags';
import PostDetailImage from './../components/postDetail/post-detail-image';
import GalleryEdit from './../components/gallery/edit';
import utils from 'utils';

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
            loading: false,
        };
    }

    toggleGalleryEdit() {
        this.setState({ galleryEditToggled: !this.state.galleryEditToggled });
    }

    saveGallery(id, params) {
        if (!id || !params || this.state.loading) return;
        this.setState({ loading: true });

        $.ajax(`/api/gallery/${id}/update`, {
            method: 'post',
            contentType: 'application/json',
            data: JSON.stringify(params),
        })
        .done((res) => {
            // Update parent gallery
            this.setState({ gallery: res });
            // Hide the modal
            this.toggleGalleryEdit();
        })
        .fail((err) => {
            $.snackbar({
                content: utils.resolveError(err, 'There was an error saving the gallery!'),
            });
        })
        .always(() => {
            this.setState({ loading: false });
        });
    }

    removeGallery(id) {
        if (!id || this.state.loading) return;

        alertify.confirm('Are you sure you want to delete this gallery?', (confirmed) => {
            if (!confirmed) return;
            this.setState({ loading: true });

            $.ajax({
                url: `/api/gallery/${id}/delete`,
                method: 'POST',
                dataType: 'json',
                contentType: 'application/json',
            })
            .done(() => {
                $.snackbar({ content: 'Gallery deleted' });
                location.href = document.referrer || '/highlights';
            })
            .fail(() => {
                $.snackbar({ content: 'Unable to delete gallery' });
            })
            .always(() => {
                this.setState({ loading: false });
            });
        });
    }

    render() {
        const { user, title, verifier } = this.props;
        const { gallery, galleryEditToggled, post, loading } = this.state;
        let editable = user.rank >= utils.RANKS.CONTENT_MANAGER && gallery.id;

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
                    <PostRelated gallery={gallery} />
                    <PostRelatedTags tags={gallery.tags} />
                </div>

                {editable && galleryEditToggled
                    ? <GalleryEdit
                        gallery={gallery}
                        toggle={() => this.toggleGalleryEdit()}
                        save={(id, p) => this.saveGallery(id, p)}
                        remove={(id) => this.removeGallery(id)}
                        loading={loading}
                        user={user}
                    />
                    : ''
                }
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
