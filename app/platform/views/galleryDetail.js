import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import utils from 'utils';
import get from 'lodash/get';
import { getFromSessionStorage, setInSessionStorage } from 'app/lib/storage';
import TopBar from './../components/topbar';
import PostList from './../components/post/list';
import Sidebar from './../components/gallery/sidebar';
import Edit from './../components/gallery/edit';
import App from './app';

/**
 * Gallery Detail Parent Object, made of a side column and PostList
 */
class GalleryDetail extends React.Component {
    static propTypes = {
        user: PropTypes.object,
        gallery: PropTypes.object,
        title: PropTypes.string,
    };

    static defaultProps = {
        gallery: {},
    };

    state = {
        editToggled: false,
        gallery: this.props.gallery,
        title: this.props.title,
        verifiedToggle: getFromSessionStorage('topbar', 'verifiedToggle', true),
    };

    onVerifiedToggled = (verifiedToggle) => {
        this.setState({ verifiedToggle });
        setInSessionStorage('topbar', { verifiedToggle });
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
        const { gallery, verifiedToggle } = this.state;
        if (!get(gallery, 'posts.length')) return [];

        if (verifiedToggle) return gallery.posts.filter(p => p.rating >= 2);

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
            verifiedToggle,
        } = this.state;

        return (
            <App 
                user={this.props.user}
                page='galleryDetail'>
                <TopBar
                    title={title}
                    editable={user.permissions.includes('update-other-content')}
                    permissions={user.permissions}
                    edit={() => this.toggleEdit()}
                    onVerifiedToggled={this.onVerifiedToggled}
                    defaultVerified={verifiedToggle}
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

ReactDOM.render(
    <GalleryDetail
        user={window.__initialProps__.user}
        gallery={window.__initialProps__.gallery}
        title={window.__initialProps__.title}
    />,
    document.getElementById('app')
);

