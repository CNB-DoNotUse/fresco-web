import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import Sidebar from './../components/user/sidebar';
import TopBar from './../components/topbar';
import PostList from './../components/post/list';
import '../../sass/platform/user.scss';

/**
 * User Detail Parent Object, made of a user side column and PostList
 */

class UserDetail extends React.Component {
    edit() {
        window.location.href = '/user/settings';
    }

    // Returns array of posts for the user
    // with offset and callback, used in child PostList
    loadPosts(last, callback) {
        const { detailUser } = this.props;
        const params = {
            limit: 15,
            last,
        };

        $.ajax({
            url: `/api/user/${detailUser.id}/posts`,
            type: 'GET',
            data: params,
            dataType: 'json',
        })
        .then((res) => {
            callback(res);
        }, () => {
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
                    timeToggle
                />

                <Sidebar
                    user={user}
                    detailUser={detailUser}
                />

                <div className="col-sm-8 tall">
                    <PostList
                        loadPosts={(p, c) => this.loadPosts(p, c)}
                        size="large"
                        permissions={user.permissions}
                        scrollable
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

