import React, { PropTypes } from 'react';
import utils from 'utils';
import isEqual from 'lodash/isEqual';
import pickBy from 'lodash/pickBy';
import get from 'lodash/get';
import api from 'app/lib/api';
import { deletePosts } from 'app/lib/models';
import { isImportedGallery, saveGallery } from 'app/lib/galleries';
import AutocompleteMap from '../global/autocomplete-map';
import { ExplicitCheckbox, EditAllLocations } from '../global/checkbox';
import ChipInput from '../global/chip-input';
import AssignmentChipInput from '../global/assignment-chip-input';
import EditPosts from './../gallery/edit-posts';
import EditByline from './../gallery/edit-byline';
import DispatchMap from 'app/platform/components/dispatch/dispatch-map';
import { merge } from 'lodash';
import time from 'app/lib/time';
import UserItem from 'app/platform/components/global/user-item';
import { postsHaveLocation } from 'app/lib/models';
import Confirm from 'app/platform/components/dialogs/confirm';

// @attention need to write documentation
export default class NewBulkEdit extends React.Component {
    static propTypes = {
        posts: PropTypes.array.isRequired,
    };

    state = this.getStateFromProps(this.props);

    // componentWillReceiveProps(nextProps) {
    //     if (this.props.gallery.id !== nextProps.gallery.id) {
    //         this.setState(this.getStateFromProps(nextProps));
    //         this.galleryCaption.className = this.galleryCaption.className.replace(/\bempty\b/, '');
    //     }
    // }

    componentDidUpdate() {
        $.material.init();
    }

    getStateFromProps(props) {
        const { posts } = props;

        return {
            loading: false,
            posts: posts,
            currentPostIndex: 0,
            editAll: true,
            confirm: false
        };
    }

    onFirstClick = (type) => {
        let confirmHeader, confirmBody, confirmButton, confirmFunction;
        switch (type) {
            case "verify":
                const { galleryType } = this.props;
                const { posts, editAll, location } = this.state;
                // this is the conditional that determines whether to prevent an admin from adding location-less posts
                if ((!editAll || (editAll && !location)) && (!postsHaveLocation(posts)) && !(galleryType === 'imports')) {
                    confirmHeader = "There's a missing location";
                    confirmBody = "Please check that all posts have a location";
                    confirmButton = "Dismiss";
                    confirmFunction = this.onConfirmCancel.bind(this);
                } else {
                    confirmHeader = "Verify Gallery";
                    confirmBody = "Are you sure you want to verify this gallery?";
                    confirmButton = "Verify";
                    confirmFunction = this.onVerify.bind(this);
                }
                break;
            case "delete":
                confirmHeader = "Delete Gallery";
                confirmBody = "WARNING: Are you sure you want to delete this gallery?";
                confirmButton = "Delete";
                confirmFunction = this.onRemove.bind(this);
                break;
        }
        this.setState({confirm: true, confirmHeader, confirmBody, confirmButton, confirmFunction });
    }

    onConfirmCancel = () => {
        this.setState({ confirm: false, confirmHeader: '', confirmBody: '', confirmButton: '' });
    }

    /**
     * Reverts all changes
     */
    onRevert = () => {
        if (this.state.loading) return;

        this.setState(this.getStateFromProps(this.props));
    }

    /**
     * Updates state map location when AutocompleteMap gives new location
     */
    onPlaceChange(place) {
        const { editAll, currentPostIndex } = this.state;
        if (editAll) {
            this.setState({ address: place.address, location: place.location });
        } else {
            const stateCopy = merge({}, this.state);
            const { posts } = stateCopy;
            posts[currentPostIndex].location = place.location;
            posts[currentPostIndex].address = place.address;
            this.setState({posts});
        }

    }

    //there is alot of overlap in onPlaceChange and onMapDataChange
    // due to the fact that they both need to modify a single post

    /**
     * Updates state map location when AutocompleteMap gives new location from drag
     */

    onMapDataChange(data) {
        const { address, location, source } = data;
        const stateCopy = merge({}, this.state);
        const { posts, currentPostIndex, editAll } = stateCopy;
        if (editAll) {
            if (source === 'markerDrag') this.setState(data);
        } else {
            if (source === 'markerDrag') {
                posts[currentPostIndex].location = location;
                posts[currentPostIndex].address = address;
                this.setState({posts});
            }
        }
    }

    onToggleDeletePost(post) {
        let { posts } = this.state;
        if (posts.some(p => p.id === post.id)) {
            posts = posts.filter(p => p.id !== post.id);
        } else {
            posts = posts.concat(post);
        }

        this.setState({ posts });
    }

    /**
     * getFormData
     *
     * @returns {Object} Form Data Object
     */
    getFormData() {
        const {
            tags,
            caption,
            stories,
            rating,
            is_nsfw,
            editAll,
        } = this.state;
        const { gallery } = this.props;

        if (caption.length === 0) {
            $.snackbar({ content: 'A gallery must have a caption' });
            return null;
        }

        let params = {
            tags,
            caption,
            is_nsfw,
            ...this.getPostsParams(),
            // @ttention get rid of stories!!
            ...utils.getRemoveAddParams('stories', gallery.stories, stories),
            external_account_name,
            external_source,
            rating,
            owner_id: owner ? owner.id : null,
        };

        if (editAll) params.address = address;
        // Make sure our params are valid types and don't have any empty arrays
        // Special exception if the param is a `bool`
        params = pickBy(params, (v, k) => {
            if (gallery[k] === v) return false;
            return Array.isArray(v) ? v.length : true;
        });
        return params;
    }

// TODO: EDIT THIS SO THAT IT CANNOT ALTER LOCATIONS IF THEy ARE ALREADY
    getPostsParams() {
        const { gallery } = this.props;
        const { address, location, rating, assignment, editAll } = this.state;
        const { posts_remove } = utils.getRemoveAddParams('posts', gallery.posts, this.state.posts);

        // check to see if should save locations on all gallery's posts
        const posts = this.state.posts.filter(p => !posts_remove.includes(p.id));
        // const sameLocation = isEqual(this.getInitialLocationData(), { address, location });
        let posts_update;
        if (!editAll) {
            posts_update = posts.map((p) => ({
                id: p.id,
                address: p.address,
                location: p.location,
                rating,
                assignment_id: assignment ? assignment.id : null,
            }));
        } else {
            posts_update = posts.map(p => pickBy({
                id: p.id,
                rating,
                assignment_id: assignment ? assignment.id : null,
            }, (v, k) => k === 'id' || p[k] !== v));
        }

        return { posts_update, posts_remove };
    }

    getInitialLocationData(gallery = null) {
        if(!gallery) {
            gallery = this.props.gallery;
        }

        const location = gallery.location || get(gallery, 'posts[0].location');
        const address = gallery.address || get(gallery, 'posts[0].address');

        return { location, address };
    }

    /**
     * Updates state with new stories
     */
    // updateStories = (stories) => {
    //     this.setState({ stories });
    // };

    onChangeIsNSFW = () => {
        this.setState({ is_nsfw: !this.state.is_nsfw });
    };

    onChangeEditAll = () => {
        this.setState({ editAll: !this.state.editAll });
    }

	/**
	 * Called when caption input fires keyUp event
	 */
    // handleChangeCaption(e) {
    //     this.setState({ caption: e.target.value });
    // }


    onSliderChange = (currentPostIndex) => {
        this.setState({currentPostIndex});
    }

    render() {
        const {
            tags,
            caption,
            assignment,
            loading,
            is_nsfw,
            posts,
            owner,
            currentPostIndex,
            confirm,
            confirmBody,
            confirmHeader,
            confirmButton,
            confirmFunction
        } = this.state;
        const currentPost = posts[currentPostIndex];
        // const shouldNotEdit = postsHaveLocation(posts);

        return (
            <div className="dialog admin-edit-pane">
                <div className="dialog-body" style={{ visibility: 'visible' }} >
                    <div className="gallery-images">
                        <EditPosts
                            originalPosts={posts}
                            editingPosts={posts}
                            onToggleDeletePost={p => this.onToggleDeletePost(p)}
                            canDelete
                            refreshInterval
                            afterChange={this.onSliderChange.bind(this)}
                        />
                    </div>
                    <section className="gallery-edit--left">
                        <UserItem user={currentPost.owner}/>
                        <li>
                            <span className="mdi mdi-camera icon"></span>
                            {time.formatTime(currentPost.created_at, true, true)}
                        </li>
                        <ExplicitCheckbox
                            is_nsfw={currentPost.is_nsfw}
                            onChange={this.onChangeIsNSFW}
                            />

                        <ChipInput
                            model="tags"
                            items={ currentPost.tags }
                            updateItems={(t) => this.setState({ tags: t })}
                            autocomplete={false}
                            multiple
                            />
                    </section>

                    <section className="gallery-edit--right">
                        <AutocompleteMap
                            location={ currentPost.location }
                            address={ currentPost.address }
                            onPlaceChange={(p) => this.onPlaceChange(p)}
                            onMapDataChange={(data) => this.onMapDataChange(data)}
                            disabled={currentPost.location ? true : false}
                            draggable={!currentPost.location ? true : false}
                            hasRadius={false}
                            rerender
                            />
                    </section>
                </div>
            </div>
		);
    }
}

// <div className="dialog-foot">
//     <button
//         type="button"
//         className="btn btn-flat"
//         onClick={this.onRevert}
//         disabled={loading}
//         >
//         Revert changes
//     </button>
//     <button
//         type="button"
//         className="btn btn-flat pull-right"
//         onClick={() => this.setState({ rating: 2 }, this.onFirstClick("verify")) }
//         disabled={loading}
//         >
//         Edit posts
//     </button>
//     <button
//         type="button"
//         className="btn btn-flat pull-right"
//         onClick={ () => this.onFirstClick("delete") }
//         disabled={loading}
//         >
//         Discard
//     </button>
//     { confirm &&
//         <Confirm
//             toggled={confirm}
//             body={confirmBody}
//             header={confirmHeader}
//             confirmText={confirmButton}
//             disabled={false}
//             hasInput={false}
//             onCancel={this.onConfirmCancel}
//             onConfirm={confirmFunction}
//
//             />
//     }
// </div>
