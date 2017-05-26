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
import api from 'app/lib/api';

import { changeSearch,
    getUsers,
    getAssignments,
    getTags,
    moveUser,
    moveAssignment,
    resetParams
} from 'app/redux/actions/stories';

/**
 * Stories Parent Object, contains StoryList composed of StoryCells
 */
class Stories extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        // api.get('story/recent')
        // .then(res => {
        //     console.log(res);
        // })
        const {
            changeSearch,
            searchParams,
            stories,
            getUsers,
            getAssignments,
            getTags,
            moveAssignment,
            moveUser,
            resetParams
        } = this.props;
        return (
            <App user={this.props.user} page="stories">
                <StoriesTopBar
                    searchParams={ searchParams }
                    onChange={ changeSearch }
                    getUsers={ getUsers }
                    getAssignments={ getAssignments }
                    getTags={ getTags }
                    moveUser={moveUser}
                    moveAssignment={moveAssignment}
                    resetParams={resetParams}/>

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
    },
    getUsers: (query) => dispatch(getUsers(query)),
    getAssignments: (query) => dispatch(getAssignments(query)),
    getTags: (query) => dispatch(getTags(query)),
    moveUser: (userID) => dispatch(moveUser(userID)),
    moveAssignment: (assignmentID) => dispatch(moveAssignment(assignmentID)),
    resetParams: () => dispatch(resetParams())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Stories);
