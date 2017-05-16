import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import partial from 'lodash/partial';
import get from 'lodash/get';
import { Map } from 'immutable';
import * as storyActions from 'app/redux/actions/stories.js';

import ReactDOM from 'react-dom';
import App from 'app/platform/views/app';
import StoriesTopBar from 'app/platform/components/story/topbar';
import StoryList from 'app/platform/components/story/story-list';
import utils from 'utils';
import merge from 'lodash/merge';

import { changeSearch } from 'app/redux/actions/stories';

/**
 * Stories Parent Object, contains StoryList composed of StoryCells
 */
class Stories extends React.Component {

    constructor(props) {
        super(props);
        // should these go into the redux store?
        this.state = {
            verified: true,
            unverified: false,
            seen: true,
            unseen: false,
            purchased: true,
            notPurchased: false,
            downloaded: true,
            notDownloaded: false,
            capturedTime: true,
            relativeTime: true,
            location: '',
            address: '',
            searchTerm: '',
            loading: false
        }
    }
    /**
     * Returns array of posts with offset and callback, used in child PostList
     */
    loadStories = (last, callback) => {
        const params = {
            last,
            limit: 20,
            sortBy: 'updated_at',
        };

        $.ajax({
            url: '/api/story/recent',
            type: 'GET',
            data: params,
            dataType: 'json',
            success: (stories) => callback(stories),
            error: (xhr, status, error) => {
                $.snackbar({ content:  'Couldn\'t fetch any stories!' });
            }
        });
    };

    render() {
        const {
            changeSearch,
            searchParams,
            stories
        } = this.props;
        return (
            <App user={this.props.user} page="stories">
                <StoriesTopBar
                    searchParams={ searchParams }
                    onChange={ changeSearch }/>

                <StoryList
                    loadStories={this.loadStories}
                    scrollable
                    stories={ stories }
                />
            </App>
        );
    }
}

// notes:
// get rid of loadStories and handle everything with redux


const mapStateToProps = (state) => {
    const user = state.get('user', Map()).toJS();
    const searchParams = state.get('searchParams', Map()).toJS();
    const stories = state.get('stories', Map()).toJS();
    return ({
        user,
        searchParams,
        stories
    });
}

const mapDispatchToProps = (dispatch) => ({
    changeSearch: (searchParam, moreParams) => {
        if (moreParams) {
            return (value) => dispatch(changeSearch({ param: searchParam, value }))
        } else {
            return dispatch(changeSearch({ param: searchParam }));
        }
    }
  // follow: (id) => dispatch(follow(id)),
  // unfollow: (id) => dispatch(unfollow(id)),
  // getBlogUser: (username) => dispatch(getBlogUser(username)),
  // clearPosts: () => dispatch(clearPosts),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Stories);
