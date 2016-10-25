import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import api from 'app/lib/api';
import App from './app';
import Sidebar from './../components/user/sidebar';
import TopBar from './../components/topbar';
import PostList from './../components/post/list';
import '../../sass/platform/user.scss';

/**
 * User Detail Parent Object, made of a user side column and PostList
 */
class UserDetail extends React.Component {
    state = {
        verifiedToggled: true,
    };

    edit() {
        window.location.href = '/user/settings';
    }

    // Returns array of posts for the user
    // with offset and callback, used in child PostList
    loadPosts = (last, callback) => {
        const { verifiedToggled } = this.state;
        const { detailUser } = this.props;
        const params = {
            limit: 15,
            rating: verifiedToggled ? 2 : [0, 1, 2],
            last,
        };

        api
        .get(`user/${detailUser.id}/posts`, params)
        .then((res) => {
            callback(res);
        })
        .catch(() => {
            $.snackbar({ content: 'We couldn\'t load this user\'s posts!' });
            callback([]);
        });
    }

    render() {
        const { user, editable, detailUser } = this.props;
        return (
            <App user={user}>
                <TopBar
                    title={detailUser.full_name}
                    editIcon={"mdi-settings"}
                    editable={editable}
                    edit={() => this.edit()}
                    onVerifiedToggled={(b) => this.setState({ verifiedToggled: b })}
                    permissions={user.permissions}
                    verifiedToggle
                    timeToggle
                />

                <Sidebar
                    user={user}
                    detailUser={detailUser}
                />

                <div className="col-sm-8 tall">
                    <PostList
                        loadPosts={this.loadPosts}
                        size="large"
                        permissions={user.permissions}
                        scrollable
                        onlyVerified={this.state.verifiedToggled}
                    />
                </div>
            </App>
        );
    }
}

UserDetail.propTypes = {
    editable: PropTypes.bool,
    user: PropTypes.object,
    detailUser: PropTypes.object,
    title: PropTypes.string,
};

ReactDOM.render(
    <UserDetail
        user={window.__initialProps__.user}
        detailUser={window.__initialProps__.detailUser}
        editable={window.__initialProps__.editable}
        title={window.__initialProps__.title}
    />,
    document.getElementById('app')
);

