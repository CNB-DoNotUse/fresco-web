import React, { PropTypes } from 'react';
import PostCell from './post-cell';
import GalleryBulkSelect from '../gallery/bulk-select';
import GalleryBulkEdit from '../gallery/bulk-edit';
import GalleryCreate from '../gallery/create';
import utils from 'utils';
import _ from 'lodash';

/**
* Post List Parent Object
* List for a set of posts used across the site
* (/videos, /photos, /gallery/id, /assignment/id , etc.)
*/
class PostList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            posts: props.posts,
            loading: false,
            scrollable: props.scrollable,
            selectedPosts: [],
            galleryCreateToggled: false,
            galleryBulkEditToggled: false,
        };

        // If we aren't dynamically loading posts, then sort them locally
        if (!this.props.scrollable && this.props.sort) {
            this.state.posts = this.sortPosts();
        }
    }

    componentWillMount() {
        // Check if list is initialzied with posts, then don't load anything
        if (this.state.posts.length) return;

        this.loadInitialPosts();
    }

    componentWillReceiveProps(nextProps) {
        // If we receive new posts in props while having none previously
        const currentPostIds = this.state.posts.length ? this.state.posts.map(p => p.id) : [];
        const newPostIds = nextProps.posts.map(p => p.id);
        const diffIds = _.difference(newPostIds, currentPostIds);
        let postsUpdated = false;

        // Check diff or if the parent tells the component to update
        if (nextProps.posts.length != this.props.posts.length || diffIds.length || nextProps.updatePosts) {
            this.setState({ posts: nextProps.posts });
            return;
        }

        // Checks if the verified prop is changed `or` Checks if the sort prop is changed
        if (nextProps.onlyVerified !== this.props.onlyVerified || nextProps.sortBy !== this.props.sortBy) {
            postsUpdated = true;

            if (nextProps.scrollable) {
                // Clear state for immediate feedback
                this.setState({ posts: [] });

                // Load posts from API
                this.loadInitialPosts();
            } else {
                this.setState({ posts: this.sortPosts() });
            }
        }

        // Tells component to set scroll to the top
        if (postsUpdated) {
            this.refs.grid.scrollTop = 0;
        }
    }

    onToggleGalleryBulkEdit() {
        if (this.props.posts.length > 1) {
            this.setState({ galleryBulkEditToggled: !this.state.galleryBulkEditToggled });
        } else {
            this.setState({ bulkEditToggled: false });
            $.snackbar({ content: 'Select more than one gallery to edit' });
        }
    }

    onToggleGalleryCreate() {
        this.setState({ galleryCreateToggled: !this.state.galleryCreateToggled });
    }

    /**
     * Sorts posts based on the current field in props
     * @return {array} An array of posts now sorted
     */
    sortPosts() {
        const field = this.props.sort === 'captured_at' ? 'captured_at' : 'created_at';

        return this.state.posts.sort((post1, post2) => post2[field] - post1[field]);
    }

    /**
     * Initial call to populate posts
     */
    loadInitialPosts() {
        // Access parent var load method
        this.props.loadPosts(null, (posts) => {
            // Set posts & callback from successful response
            this.setState({ posts });
        });
    }

    /**
     * Scroll listener for main window
     */
    scroll(e) {
        const grid = e.target;

        // Check that nothing is loading and that we're at the end of the scroll,
        // and that we have a parent bind to load  more posts
        if (!this.state.loading && grid.scrollTop > ((grid.scrollHeight - grid.offsetHeight) - 400) && this.props.loadPosts) {

            // Set that we're loading
            this.setState({ loading: true });

            // Run load on parent call
            this.props.loadPosts(_.last(this.state.posts).id, (posts) => {
                // Disables scroll, and returns if posts are empty
                if (!posts || posts.length == 0) {
                    return this.setState({
                        scrollable: false,
                    });
                }

                // Set galleries from successful response, and unset loading
                this.setState({
                    posts: this.state.posts.concat(posts),
                    loading: false,
                });
            }, this);
        }
    }

    /**
     * Toggles posts in stateful selected posts
     * @param  {object} passedPost The post to
     * toggle selected or unselected in the post-list and bulk edit
     */
    togglePost(passedPost) {
        const { selectedPosts } = this.state;

        // Check if `not` CM
        if (this.props.rank < utils.RANKS.CONTENT_MANAGER) return;

        // Make sure we haven't reached the limit
        if (selectedPosts.length >= utils.limits.galleryItems) {
            $.snackbar({ content: 'Galleries can only contain up to 10 items!' });
            return;
        }

        // Filter out anything, but ones that equal the passed post
        // Post not found, so add
        if (!selectedPosts.some((s) => s.id === passedPost.id)) {
            this.setState({ selectedPosts: selectedPosts.concat(passedPost) });
        } else {
            // No post found
            this.setState({
                selectedPosts: selectedPosts.filter((post) => post.id !== passedPost.id),
            });
        }
    }

    renderPosts() {
        const {
            rank,
            size,
            assignment,
            editable,
            sort,
            parentCaption,
        } = this.props;
        const {
            posts,
            selectedPosts,
        } = this.state;

        if (!posts.length) return '';

        return posts.map((p, i) => (
            <PostCell
                size={size}
                parentCaption={parentCaption}
                post={p}
                rank={rank}
                toggled={selectedPosts.some((s) => s.id === p.id)}
                assignment={assignment}
                key={i}
                editable={editable}
                sort={sort}
                togglePost={(post) => this.togglePost(post)}
            />
        ));
    }

    render() {
        const { className, scroll } = this.props;
        const {
            selectedPosts,
            scrollable,
            galleryBulkEditToggled,
            galleryCreateToggled,
        } = this.state;

        return (
            <div>
                <div
                    className={`container-fluid fat grid ${className}`}
                    ref="grid"
                    onScroll={scrollable ? scroll || ((e) => this.scroll(e)) : null}
                >
                    <div className="row tiles" id="posts">{this.renderPosts()}</div>

                    {selectedPosts && selectedPosts.length > 1
                        ? <GalleryBulkSelect
                            posts={selectedPosts}
                            setSelectedPosts={(p) => this.setState({ selectedPosts: p })}
                            onToggleEdit={() => this.onToggleGalleryBulkEdit()}
                            onToggleCreate={() => this.onToggleGalleryCreate()}
                        />
                        : ''
                    }

                    {galleryBulkEditToggled
                        ? <GalleryBulkEdit
                            posts={selectedPosts}
                            onHide={() => this.onToggleGalleryBulkEdit()}
                        />
                        : ''
                    }

                    {galleryCreateToggled
                        ? <GalleryCreate
                            posts={selectedPosts}
                            setSelectedPosts={(p) => this.setState({ selectedPosts: p })}
                            onHide={() => this.onToggleGalleryCreate()}
                        />
                        : ''
                    }

                </div>
            </div>
        );
    }
}

PostList.propTypes = {
    posts: PropTypes.array,
    scrollable: PropTypes.bool,
    rank: PropTypes.number,
    size: PropTypes.string,
    assignment: PropTypes.object,
    editable: PropTypes.bool,
    sort: PropTypes.string,
    onlyVerified: PropTypes.bool,
    parentCaption: PropTypes.string,
    className: PropTypes.string,
    scroll: PropTypes.func,
    loadPosts: PropTypes.func,
};

PostList.defaultProps = {
    className: '',
    size: 'small',
    editable: true,
    posts: [],
    scrollable: false,
    onlyVerified: false,
    loadPosts() {},
};

export default PostList;

