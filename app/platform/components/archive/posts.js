import React, { PropTypes } from 'react';
import utils from 'utils';
import api from 'app/lib/api';
import { getFromSessionStorage, setInSessionStorage } from 'app/lib/storage';
import { geoParams } from 'app/lib/location';
import App from 'app/platform/views/app';
import get from 'lodash/get';
import PostList from '../post/list';
import TopBar from '../topbar';
import TagFilter from '../topbar/tag-filter';
import LocationDropdown from '../topbar/location-dropdown';
import { connect } from 'react-redux';
import { Map } from 'immutable';

import {
    addPost,
    removePost,
    addTag,
    removeTag,
    changeCaption,
    changeTitle,
    changeHighlighted,
    clearFields,
    clearPosts,
    changePostIndex
} from 'app/redux/actions/stories_create';

/**
 * Archive Component (composed of PostList and Navbar)
 * @description View page for different types of content
 */
class Posts extends React.Component {
    static propTypes = {
        user: PropTypes.object,
        type: PropTypes.oneOf(['photo', 'video', null]),
        page: PropTypes.oneOf(['photos', 'videos', 'archive']),
        title: PropTypes.oneOf(['Archive', 'Photos', 'Videos']),
        store: PropTypes.object
    };

    state = {
        verifiedToggle: getFromSessionStorage('topbar', 'verifiedToggle', true),
        sortBy: getFromSessionStorage('topbar', 'sortBy', 'created_at'),
        location: getFromSessionStorage('archive', 'location', {}),
        tags: getFromSessionStorage('archive', 'tags', []),
    };

    reloadPosts = false;


    onVerifiedToggled = (verifiedToggle) => {
        this.setState({ verifiedToggle });
        setInSessionStorage('topbar', { verifiedToggle });
    };

    onChronToggled = (sortBy) => {
        this.setState({ sortBy });
        setInSessionStorage('topbar', { sortBy });
    };

    /**
     * Called on Location dropdown state changes
     */
    onChangeLocation = (location) => {
        this.reloadPosts = true;
        this.setState({ location });
        setInSessionStorage('archive', { location });
    };

    onAddTag = (tag) => {
        const tags = this.state.tags.concat(tag);
        this.reloadPosts = true;
        this.setState({ tags });
        setInSessionStorage('archive', { tags });
    };

    onRemoveTag = (tag) => {
        const tags = this.state.tags.filter(t => t !== tag);
        this.reloadPosts = true;
        this.setState({ tags });
        setInSessionStorage('archive', { tags });
    };

    /**
     * Returns array of posts with last and callback, used in child PostList
     */
    loadPosts = (last, callback) => {
        const { type } = this.props;
        const { sortBy, location, tags, verifiedToggle } = this.state;
        const params = {
            last,
            limit: utils.postCount,
            rating: [0, 1, 2],
            ...geoParams(location),
            posts: true,
            post_type: type,
            tags,
            sortBy,
            count:false //Don't return a count
        };

        if (verifiedToggle) params.rating = 2;

        api
        .get('search', params)
        .then((res) => {
            this.reloadPosts = false;
            callback(get(res, 'posts.results', []));
        })
        .catch(() => {
            $.snackbar({ content: `Failed to load ${type ? type : 'post'}s` });
            callback([]);
        });
    };

    render() {
        const { user, title, page, storyCreation, storyFunctions, postFunctions } = this.props;
        const { sortBy, verifiedToggle, location, tags } = this.state;
        return (
            <App
                user={user}
                page={page}
            >
                <TopBar
                    title={title}
                    roles={user.roles}
                    onChronToggled={this.onChronToggled}
                    onVerifiedToggled={this.onVerifiedToggled}
                    defaultVerified={verifiedToggle}
                    defaultChron={sortBy}
                    chronToggle
                    timeToggle
                    verifiedToggle
                >
                    <TagFilter
                        onTagAdd={this.onAddTag}
                        onTagRemove={this.onRemoveTag}
                        filterList={tags}
                        attr=""
                        key="tagFilter"
                    />
                    <LocationDropdown
                        location={location}
                        units="Miles"
                        key="locationDropdown"
                        onChangeLocation={this.onChangeLocation}
                    />
                </TopBar>
                <PostList
                    size="small"
                    sortBy={sortBy}
                    onlyVerified={verifiedToggle}
                    loadPosts={this.loadPosts}
                    reloadPosts={this.reloadPosts}
                    scrollable
                    user={user}
                    page={page}
                    storyCreation={storyCreation}
                    storyFunctions={storyFunctions}
                    postFunctions={postFunctions}
                />
            </App>
        );
    }
}


const mapStateToProps = (state) => {
    const storyCreation = state.get('storyCreation', Map());
    return ({
        storyCreation
    });
}

const mapDispatchToProps = (dispatch) => ({
    postFunctions: {
        addPost: (post) => dispatch(addPost(post)),
        removePost: (post) => dispatch(removePost(post))
    },
    storyFunctions: {
        addTag: (tag) => dispatch(addTag(tag)),
        removeTag: (tag) => dispatch(removeTag(tag)),
        changeCaption: (caption) => dispatch(changeCaption(caption)),
        changeTitle: (title) => dispatch(changeTitle(title)),
        changeHighlighted: () => dispatch(changeHighlighted()),
        clearFields: () => dispatch(clearFields()),
        clearPosts: () => dispatch(clearPosts()),
        changePostIndex: (index) => dispatch(changePostIndex(index))
    }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Posts);
