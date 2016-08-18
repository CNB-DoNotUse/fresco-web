import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import TopBar from './../components/topbar';
import PostList from './../components/post/list';
import Sidebar from './../components/gallery/sidebar';
import Edit from './../components/gallery/edit';
import App from './app';
import utils from 'utils';
import get from 'lodash/get';

/**
 * Gallery Detail Parent Object, made of a side column and PostList
 */
class GalleryDetail extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            editToggled: false,
            gallery: props.gallery,
            title: props.title,
            verifiedToggled: true,
        };
    }

    componentDidMount() {
        setInterval(() => {
            if (!this.state.editToggled) {
                this.fetchGallery();
            }
        }, 5000);
    }

	/**
     * Updates gallery in state
     */
    onUpdateGallery(gallery) {
        this.setState({
            gallery,
            title: utils.getTitleFromGallery(gallery),
            updatePosts: true,
        });
    }

    getPostsFromGallery() {
        const { gallery, verifiedToggled } = this.state;
        if (!get(gallery, 'posts.length')) return [];

        if (verifiedToggled) return gallery.posts.filter(p => p.rating >= 2);
        return gallery.posts;
    }

    fetchGallery() {
        const { gallery } = this.state;
        if (!gallery || !gallery.id) return;

        $.ajax({
            url: `/api/gallery/${gallery.id}`,
        })
        .then((res) => {
            this.setState({ gallery: res });
        });
    }

    toggleEdit() {
        this.setState({ editToggled: !this.state.editToggled });
    }

    render() {
        const { user } = this.props;
        const {
            gallery,
            title,
            updatePosts,
            editToggled,
        } = this.state;

        return (
            <App user={user}>
                <TopBar
                    title={title}
                    editable={user.permissions.includes('update-other-content')}
                    permissions={user.permissions}
                    edit={() => this.toggleEdit()}
                    onVerifiedToggled={(b) => this.setState({ verifiedToggled: b })}
                    verifiedToggle
                    timeToggle
                />

                <Sidebar gallery={gallery} />

                <div className="col-sm-8 tall">
                    <PostList
                        permissions={user.permissions}
                        parentCaption={gallery.caption}
                        posts={this.getPostsFromGallery()}
                        updatePosts={updatePosts}
                        scrollable={false}
                        editable={false}
                        size="large"
                    />
                </div>

                <Edit
                    toggle={() => this.toggleEdit()}
                    visible={editToggled}
                    onUpdateGallery={(g) => this.onUpdateGallery(g)}
                    gallery={gallery}
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
