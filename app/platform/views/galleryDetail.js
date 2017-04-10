import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import utils from 'utils';
import get from 'lodash/get';
import last from 'lodash/last';
import { getFromSessionStorage, setInSessionStorage } from 'app/lib/storage';
import { getLikes, getReposts } from 'app/lib/gallery';
import { scrolledToBottom } from 'app/lib/helpers';
import TopBar from './../components/topbar';
import PostList from './../components/post/list';
import Sidebar from './../components/gallery/sidebar';
import Edit from './../components/gallery/edit';
import Recommend from './../components/gallery/recommend';
import App from './app';
import ItemsDialog from '../components/dialogs/items';
import UserItem from '../components/global/user-item';

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
        recommendToggled: false,
        editToggled: false,
        gallery: this.props.gallery,
        title: this.props.title,
        likes: null,
        reposts: null,
        loading: false,
        likesDialog: false,
        repostsDialog: false,
        verifiedToggle: getFromSessionStorage('topbar', 'verifiedToggle', true),
    };

    onVerifiedToggled = (verifiedToggle) => {
        this.setState({ verifiedToggle });
        setInSessionStorage('topbar', { verifiedToggle });
    };

    /**
     * OnScroll event passed up from the dialogs
     * @param  {Object} e       Target
     * @param  {String} context context passed down to items-dialog
     */
    onScroll = (e, context) => {
        const grid = e.target;
        const bottomReached = scrolledToBottom(grid, 50);

        if(!bottomReached || this.state.loading) return;

        this.setState({ loading: true });

        switch(context) {
            case 'likes':
                getLikes(this.state.gallery.id, {
                        last: last(this.state.likes).id
                    })
                    .then(likes => {
                        this.setState({
                            likes: this.state.likes.concat(likes),
                            loading: likes.length > 0
                        })
                    })
                break;
            case 'reposts':
                    getReposts(this.state.gallery.id, {
                            last: last(this.state.reposts).id
                        })
                        .then(reposts => {
                            this.setState({
                                reposts: this.state.reposts.concat(reposts),
                                loading: reposts.length > 0
                            })
                        })
                break;
        }
    };

    onClickLikes = () => {
        const { likes, gallery } = this.state;
        getLikes(gallery.id)
            .then(likes => {
                this.setState({ likes, loading: false })
            })

        this.setState({ likesDialog: !this.state.likesDialog });
    };

    onClickReposts = () => {
        const { reposts, gallery } = this.state;
        getReposts(gallery.id)
            .then(reposts => {
                this.setState({ reposts, loading: false })
            })

        this.setState({ repostsDialog: !this.state.repostsDialog });
    };

    /**
     * Updates gallery in state
     */
    onUpdateGallery(gallery) {
        console.log(gallery);


        this.setState({
            gallery,
            title: utils.getTitleFromGallery(gallery),
            updatePosts: true,
        });
    }

    /**
     * Returns an array of posts based on current verified toggle state
     */
    getPostsFromGallery() {
        const { gallery, verifiedToggle } = this.state;
        if (!get(gallery, 'posts.length')) return [];

        if (verifiedToggle) return gallery.posts.filter(p => p.rating >= 2);

        return gallery.posts;
    }

    toggleEdit() {
        this.setState({ editToggled: !this.state.editToggled });
    }

    toggleRecommend() {
        this.setState({ recommendToggled: !this.state.recommendToggled });
    }

    render() {
        const { user } = this.props;
        const {
            gallery,
            title,
            updatePosts,
            editToggled,
            recommendToggled,
            verifiedToggle,
            likes,
            reposts,
            likesDialog,
            repostsDialog
        } = this.state;
        const page = 'galleryDetail';
        return (
            <App
                user={user}
                page={page}>
                <TopBar
                    title={title}
                    editable={user.roles.includes('admin')}
                    roles={user.roles}
                    edit={() => this.toggleEdit()}
                    onVerifiedToggled={this.onVerifiedToggled}
                    defaultVerified={verifiedToggle}
                    isGalleryDetail={true}
                    galleryRating={gallery.rating}
                    modalFunctions={[() => this.toggleRecommend()]}
                    verifiedToggle
                    timeToggle
                />

                <Sidebar
                    onClickLikes={this.onClickLikes}
                    onClickReposts={this.onClickReposts}
                    gallery={gallery} />

                <div className="col-sm-8 tall">
                    <PostList
                        parentCaption={gallery.caption}
                        posts={this.getPostsFromGallery()}
                        updatePosts={updatePosts}
                        scrollable={false}
                        editable={false}
                        size="large"
                        page={page}
                        user={user}
                    />
                </div>


                <ItemsDialog
                    toggled={likesDialog}
                    onClose={() => this.setState({ likesDialog: false })}
                    scrollable={true}
                    context='likes'
                    onScroll={this.onScroll}
                    emptyMessage={!likes ? 'Loading likes...' : likes.length === 0 ? "No likes :(" : ''}
                    header={`Likes (${gallery.likes})`}
                >
                    {likes ?
                        likes.map((u, i) => (
                            <UserItem key={`likes-user-${i}`} user={u} />
                        ))
                        :
                        null
                    }
                </ItemsDialog>


                <ItemsDialog
                    toggled={repostsDialog}
                    onClose={() => this.setState({ repostsDialog: false })}
                    scrollable={true}
                    context='reposts'
                    onScroll={this.onScroll}
                    emptyMessage={!reposts ? 'Loading reposts...' : reposts.length === 0 ? "No reposts :(" : ''}
                    header={`Reposts (${gallery.reposts})`}
                >
                    {reposts ?
                        reposts.map((u, i) => (
                            <UserItem key={`reposts-user-${i}`} user={u} />
                        ))
                        :
                        null
                    }
                </ItemsDialog>

                <Edit
                    toggle={() => this.toggleEdit()}
                    visible={editToggled}
                    onUpdateGallery={(g) => this.onUpdateGallery(g)}
                    gallery={gallery}
                    user={user}
                />
                <Recommend
                    toggle={() => this.toggleRecommend()}
                    visible={recommendToggled}
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
