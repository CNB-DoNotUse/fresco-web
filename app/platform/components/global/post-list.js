import _ from 'lodash';
import React from 'react';
import PostCell from './post-cell';
import GalleryEdit from '../editing/gallery-edit';
import GalleryBulkSelect from '../editing/gallery-bulk-select';
import utils from 'utils';
import GalleryCreate from '../editing/gallery-create';

/** //
    Description : List for a set of posts used across the site (/videos, /photos, /gallery/id, /assignment/id , etc.)
// **/

/**
    * Post List Parent Object
*/

class PostList extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            posts: this.props.posts,
            loading: false,
            scrollable: this.props.scrollable,
            selectedPosts: [],
            gallery: null,
            galleryEditToggled: false,
        };

        // If we aren't dynamically loading posts, then sort them locally
        if (!this.props.scrollable && this.props.sort) {
            this.state.posts = this.sortPosts();
        }

        this.togglePost 		= this.togglePost.bind(this);
        this.setSelectedPosts 	= this.setSelectedPosts.bind(this);
        this.sortPosts 		    = this.sortPosts.bind(this);
        this.scroll 			= this.scroll.bind(this);
        this.edit 				= this.edit.bind(this);
        this.toggle				= this.toggle.bind(this);
        this.loadInitialPosts	= this.loadInitialPosts.bind(this);
    }

    componentWillMount() {
        // Check if list is initialzied with posts, then don't load anything
        if (this.state.posts.length) return;

        this.loadInitialPosts();
    }

    componentWillReceiveProps(nextProps) {
        // If we receive new posts in props while having none previously
        let currentPostIds = this.state.posts.map(p => p.id);
        let newPostIds = nextProps.posts.map(p => p.id);
        let diffIds = _.difference(newPostIds, currentPostIds);
        let postsUpdated = false;

        // Check diff or if the parent tells the component to update
        if (nextProps.posts.length != this.props.posts.length || diffIds.length || nextProps.updatePosts) {
            return this.setState({
                posts: nextProps.posts,
            });
        }

        // Checks if the verified prop is changed `or` Checks if the sort prop is changed
        if (nextProps.onlyVerified !== this.props.onlyVerified || nextProps.sort !== this.props.sort) {
            postsUpdated = true;

            if (nextProps.scrollable) {
                // Clear state for immediate feedback
                this.setState({ posts: [] });

                // Load posts from API
                this.loadInitialPosts();
            } else {
                this.setState({
                    posts: this.sortPosts(),
                });
            }
        }

        // Tells component to set scroll to the top
        if (postsUpdated) {
            this.refs.grid.scrollTop = 0;
        }
    }

    /**
     * Sorts posts based on the current field in props
     * @return {array} An array of posts now sorted
     */
    sortPosts() {
        let field = this.props.sort == 'captured_at' ? 'captured_at' : 'created_at';

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

        var grid = e.target;

        // Check that nothing is loading and that we're at the end of the scroll,
        // and that we have a parent bind to load  more posts
        if (!this.state.loading && grid.scrollTop > ((grid.scrollHeight - grid.offsetHeight) - 400) && this.props.loadPosts) {

            // Set that we're loading
            this.setState({ loading: true });

            // This is here for the new post-list structure, so we check to send an id or an offset integer

            const lastPost = this.state.posts[this.state.posts.length - 1];

            // Run load on parent call
            this.props.loadPosts(lastPost.id, (posts) => {

                // Disables scroll, and returns if posts are empty
                if (!posts || posts.length == 0) {

                    this.setState({
                        scrollable: false,
                    });

                    return;
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
     * Sets the `selectedPosts` state property
     * @param {array} posts The posts to set the `selectedPosts` to
     */
    setSelectedPosts(posts) {
        this.setState({ selectedPosts: posts });
    }

    /**
     * Toggles posts in stateful selected posts
     * @param  {object} passedPost The post to toggle selected or unselected in the post-list and bulk edit
     */
    togglePost(passedPost) {
        // Check if `not` CM
        if (this.props.rank < utils.RANKS.CONTENT_MANAGER) return;


        // Make sure we haven't reached the limit
        if (this.state.selectedPosts.length >= utils.limits.galleryItems) {
            return $.snackbar({ content: 'Galleries can only contain up to 10 items!' });
        }

        // Filter out anything, but ones that equal the passed post
        var result = this.state.selectedPosts.filter((post) => {
            return passedPost.id === post.id;
        });


        // Post not found, so add
        if (result.length == 0) {
            this.setState({
                selectedPosts: this.state.selectedPosts.concat(passedPost),
            });
        }
        // No post found
        else {
            this.setState({
                selectedPosts: this.state.selectedPosts.filter((post) => post.id !== passedPost.id),
            });
        }
    }

    /**
     * Called when PostCellAction's Edit button is clicked
     * @param  {Object} post - Has post
     */
    edit(gallery) {
        this.setState({ gallery, galleryEditToggled: true });
    }

    /**
     * Called when GalleryEdit should be toggled
     */
    toggle() {
        if (this.state.galleryEditToggled) {
            this.setState({
                gallery: null,
                galleryEditToggled: false,
            });
        }
    }

    render() {
        const {
            rank,
            size,
            assignment,
            editable,
            sort,
            onlyVerified,
            parentCaption,
            className
        } = this.props;
        const { posts, selectedPosts } = this.state;
        let postCmps = [];

        for (let i = 0; i < posts.length; i++) {

            let post = posts[i];

            // Check if post should be added based on approvals and verified toggle
            if (onlyVerified && post.approvals === 0) {
                continue;
            }

            // Filter out this posts from the currently selected posts
            const filteredPosts = selectedPosts.filter((currentPost) => currentPost.id === post.id);
            // Pass down toggled if this post is inside the filtered posts
            let toggled = filteredPosts.length > 0;

            postCmps.push(
                <PostCell
                    size={size}
                    parentCaption={parentCaption}
                    post={post}
                    rank={rank}
                    toggled={toggled}
                    assignment={assignment}
                    key={i}
                    editable={editable}
                    sort={sort}
                    togglePost={this.togglePost}
                    edit={this.edit}
                />
            );
        }

        return (
            <div>
                <div
                    className={'container-fluid fat grid ' + className}
                    ref="grid"
                    onScroll={this.state.scrollable ? this.props.scroll ? this.props.scroll : this.scroll : null}
                >
                    <div className="row tiles" id="posts">{postCmps}</div>
                </div>

                <GalleryBulkSelect
                    posts={this.state.selectedPosts}
                    setSelectedPosts={this.setSelectedPosts}
                />

                <GalleryEdit
                    gallery={this.state.gallery}
                    toggled={this.state.galleryEditToggled}
                    toggle={this.toggle}
                />

                <GalleryCreate
                    setSelectedPosts={this.setSelectedPosts}
                    posts={this.state.selectedPosts}
                />
            </div>
        );
    }
}

PostList.defaultProps = {
    className: '',
    size: 'small',
    editable: true,
    posts: [],
    gallery: null,
    scrollable: false,
    onlyVerified: false,
    loadPosts() {},
};

export default PostList;

