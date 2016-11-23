import React, { PropTypes } from 'react';
import utils from 'utils';
import last from 'lodash/last';
import { getFromSessionStorage, setInSessionStorage } from 'app/lib/storage';
import PostCell from './cell';
import GalleryBulkSelect from '../gallery/bulk-select';
import GalleryBulkEdit from '../gallery/bulk-edit';
import GalleryCreate from '../gallery/create';

/**
 * Post List Parent Object
 * List for a set of posts used across the site
 * (/videos, /photos, /gallery/id, /assignment/id , etc.)
 */
class PostList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            posts: props.posts || [],
            loading: false,
            scrollable: props.scrollable,
            selectedPosts: getFromSessionStorage('post/list', 'selectedPosts', []),
            galleryCreateToggled: false,
            galleryBulkEditToggled: false,
        };

        // If we aren't dynamically loading posts, then sort them locally
        if (!this.props.scrollable && this.props.sortBy) {
            this.state.posts = this.sortPosts();
        }
    }

    componentWillMount() {
        // Check if list is initialzied with posts, then don't load anything
        if (this.state.posts.length) return;

        this.loadInitialPosts();
    }

    componentWillReceiveProps(nextProps) {
        // If we receive new posts in props
        if (nextProps.posts) {
            const currentPostIds = this.state.posts.length ? this.state.posts.map(p => p.id) : [];
            const newPostIds = nextProps.posts.map(p => p.id);
            const differentPosts = (JSON.stringify(currentPostIds) !== JSON.stringify(newPostIds));

            // Check if the parent tells the component to update
            if (differentPosts || nextProps.updatePosts) {
                this.setState({ posts: nextProps.posts });
                return;
            }
        }

        // Checks if the verified prop is changed `or` Checks if the sortBy prop is changed
        const verifiedChanged = nextProps.onlyVerified !== this.props.onlyVerified;
        const sortByChanged = nextProps.sortBy !== this.props.sortBy;
        if (verifiedChanged || sortByChanged) {
            this.grid.scrollTop = 0;

            if (nextProps.scrollable) {
                // Clear state for immediate feedback
                this.setState({ posts: [] });

                // Load posts from API
                this.loadInitialPosts();
            } else {
                this.setState({ posts: this.sortPosts() });
            }
        }

        if (nextProps.scrollTo !== this.props.scrollTo) {
            const $grid = $(this.grid);
            const paddingTop = parseInt($grid.css('padding-top'), 10);
            $grid.animate({
                scrollTop: this[`cell${nextProps.scrollTo}`].area.offsetTop - paddingTop,
            });
        }
    }

    onToggleGalleryBulkEdit = () => {
        if (this.state.selectedPosts.length > 1) {
            this.setState({ galleryBulkEditToggled: !this.state.galleryBulkEditToggled });
        } else {
            this.setState({ galleryBulkEditToggled: false });
            $.snackbar({ content: 'Select more than one gallery to edit' });
        }
    }

    onToggleGalleryCreate = () => {
        this.setState({ galleryCreateToggled: !this.state.galleryCreateToggled });
    }

    /**
     * Scroll listener for main window
     */
    onScroll = (e) => {
        const grid = e.target;
        if (!this.area || !this.area.contains(e.target)) {
            return;
        }

        const endOfScroll = grid.scrollTop > ((grid.scrollHeight - grid.offsetHeight) - 400);

        // Check that nothing is loading and that we're at the end of the scroll
        if (!this.state.loading && endOfScroll) {
            // Set that we're loading
            const lastPost = last(this.state.posts);
            if (!lastPost) return;
            this.setState({ loading: true });

            // Run load on parent call
            this.props.loadPosts(lastPost[this.props.paginateBy], (posts) => {
                if (!posts || posts.length === 0) {
                    this.setState({ loading: false });
                    return;
                }

                // Set galleries from successful response, and unset loading
                this.setState({
                    posts: this.state.posts.concat(posts),
                    loading: false,
                });
            });
        }
    }

    onToggleGalleryBulkEdit = () => {
        if (this.state.selectedPosts.length > 1) {
            this.setState({ galleryBulkEditToggled: !this.state.galleryBulkEditToggled });
        } else {
            this.setState({ galleryBulkEditToggled: false });
            $.snackbar({ content: 'Select more than one gallery to edit' });
        }
    }

    onToggleGalleryCreate = () => {
        this.setState({ galleryCreateToggled: !this.state.galleryCreateToggled });
    }

    setSelectedPosts = (newSelected) => {
        this.setState({ selectedPosts: newSelected });
        setInSessionStorage('post/list', { selectedPosts: newSelected });
    }

    /**
     * Toggles posts in stateful selected posts
     * @param  {object} passedPost The post to
     * toggle selected or unselected in the post-list and bulk edit
     */
    togglePost = (passedPost) => {
        const { selectedPosts } = this.state;
        const { permissions } = this.props;

        // Check if `not` CM
        if (!permissions.includes('update-other-content')) return;

        // Filter out anything, but ones that equal the passed post
        // Post not found, so add
        let newSelected = [];
        if (!selectedPosts.some(s => s.id === passedPost.id)) {
            // Make sure we haven't reached the limit
            if (selectedPosts.length >= utils.limits.galleryItems) {
                $.snackbar({ content: `Galleries can only contain up to ${utils.limits.galleryItems} items!` });
                return;
            }
            newSelected = selectedPosts.concat(passedPost);
        } else {
            // No post found
            newSelected = selectedPosts.filter(post => post.id !== passedPost.id);
        }

        this.setSelectedPosts(newSelected);
    }

    /**
     * Sorts posts based on the current field in props
     * @return {array} An array of posts now sorted
     */
    sortPosts() {
        const field = this.props.sortBy === 'captured_at' ? 'captured_at' : 'created_at';

        return this.state.posts.sort((post1, post2) => post2[field] - post1[field]);
    }

    /**
     * Initial call to populate posts
     */
    loadInitialPosts() {
        this.props.loadPosts(null, (posts) => { this.setState({ posts }); });
    }

    renderPosts() {
        const {
            permissions,
            size,
            assignment,
            editable,
            sortBy,
            parentCaption,
            onMouseEnterPost,
            onMouseLeaveList,
        } = this.props;
        const {
            posts,
            selectedPosts,
        } = this.state;

        if (!posts.length) return '';

        return (
            <div>
                <div
                    onMouseLeave={onMouseLeaveList}
                    className="row tiles"
                    id="posts"
                >
                    {posts.map((p, i) => (
                        <PostCell
                            ref={(r) => { this[`cell${p.id}`] = r; }}
                            size={size}
                            parentCaption={parentCaption}
                            post={p}
                            permissions={permissions}
                            toggled={selectedPosts.some(s => s.id === p.id)}
                            assignment={assignment}
                            key={i}
                            editable={editable}
                            sortBy={sortBy}
                            onMouseEnter={onMouseEnterPost}
                            togglePost={this.togglePost}
                        />
                    ))}
                </div>
            </div>
        );
    }

    render() {
        const { className, onScroll } = this.props;
        const {
            selectedPosts,
            scrollable,
            galleryBulkEditToggled,
            galleryCreateToggled,
        } = this.state;

        return (
            <div ref={(r) => { this.area = r; }}>
                <div
                    className={`container-fluid grid ${className}`}
                    ref={(r) => { this.grid = r; }}
                    onScroll={scrollable ? onScroll || this.onScroll : null}
                >
                    {this.renderPosts()}

                    {(selectedPosts && selectedPosts.length > 1) && (
                        <GalleryBulkSelect
                            posts={selectedPosts}
                            setSelectedPosts={this.setSelectedPosts}
                            onToggleEdit={this.onToggleGalleryBulkEdit}
                            onToggleCreate={this.onToggleGalleryCreate}
                        />
                    )}

                    {galleryBulkEditToggled && (
                        <GalleryBulkEdit
                            posts={selectedPosts}
                            onHide={this.onToggleGalleryBulkEdit}
                        />
                    )}

                    {galleryCreateToggled && (
                        <GalleryCreate
                            posts={selectedPosts}
                            setSelectedPosts={this.setSelectedPosts}
                            onHide={this.onToggleGalleryCreate}
                        />
                    )}
                </div>
            </div>
        );
    }
}

PostList.propTypes = {
    posts: PropTypes.array,
    scrollable: PropTypes.bool,
    permissions: PropTypes.array,
    size: PropTypes.string,
    assignment: PropTypes.object,
    editable: PropTypes.bool,
    onlyVerified: PropTypes.bool,
    parentCaption: PropTypes.string,
    sortBy: PropTypes.string,
    className: PropTypes.string,
    paginateBy: PropTypes.string,
    onScroll: PropTypes.func,
    onMouseEnterPost: PropTypes.func,
    onMouseLeaveList: PropTypes.func,
    loadPosts: PropTypes.func,
};

PostList.defaultProps = {
    className: '',
    size: 'small',
    editable: true,
    scrollable: false,
    onlyVerified: false,
    loadPosts() {},
    permissions: [],
    paginateBy: 'id',
};

export default PostList;
