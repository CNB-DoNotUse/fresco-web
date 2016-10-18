import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import TopBar from './../components/topbar';
import PostList from './../components/post/list';
import Sidebar from './../components/assignment/sidebar';
import Edit from './../components/assignment/edit.js';
import App from './app';
import utils from 'utils';
import 'app/sass/platform/_assignment';
import 'app/sass/platform/_posts';

/**
 * Story Detail Parent Object, made of a side column and PostList
 */
class AssignmentDetail extends React.Component {
    state = {
        assignment: this.props.assignment,
        editToggled: false,
        verifiedToggle: true,
        sortBy: 'created_at',
        loading: false,
    };

    componentDidMount() {
        setInterval(() => {
            if (!this.state.editToggled) {
                this.fetchAssignment();
            }
        }, 5000);
    }

    onVerifiedToggled(verifiedToggle) {
        this.setState({ verifiedToggle });
    }

    updateSort(sortBy) {
        this.setState({ sortBy });
    }

    fetchAssignment() {
        const { assignment } = this.state;
        if (!assignment || !assignment.id) return;

        $.ajax({
            url: `/api/assignment/${assignment.id}`,
        })
        .then((res) => {
            this.setState({ assignment: res });
        });
    }

    /**
     * Returns array of posts with offset and callback, used in child PostList
     * @param {string} lastId Last post in the list
     * @param {function} callback callback delivering posts
     */
    loadPosts(last, callback) {
        const { assignment, sortBy, verifiedToggle } = this.state;
        const params = {
            limit: 10,
            sortBy,
            last,
            rating: verifiedToggle ? 2 : [1, 2],
        };

        $.ajax({
            url: `/api/assignment/${assignment.id}/posts`,
            type: 'GET',
            data: params,
            dataType: 'json',
        })
        .done((res) => {
            callback(res);
        })
        .fail((xhr, status, error) => {
            $.snackbar({ content: utils.resolveError(error) });
        });
    }

    /**
     * Sets the assignment to expire
     * Invoked from the on-page button `Expire`
     */
    expireAssignment() {
        this.setState({ loading: true });

        $.ajax({
            method: 'POST',
            url: `/api/assignment/${this.state.assignment.id}/update`,
            data: JSON.stringify({
                ends_at: Date.now(),
            }),
            dataType: 'json',
            contentType: 'application/json',
        })
        .done((response) => {
            $.snackbar({ content: 'Assignment expired' });
            this.setState({ assignment: response });
        })
        .fail(() => {
            $.snackbar({
                content: utils.resolveError(response.err, 'There was an error expiring this assignment!')
            });
        })
        .always(() => {
            this.setState({ loading: false });
        });
    }

	/**
	 * Saves the assignment from the current values in the form
	 */
    save(id, params) {
        if (!id || !params || this.state.loading) return;
        this.setState({ loading: true });

        $.ajax({
            url: `/api/assignment/${id}/update`,
            method: 'post',
            data: JSON.stringify(params),
            dataType: 'json',
            contentType: 'application/json',
        })
        .done((res) => {
            $.snackbar({ content: 'Assignment saved!' });
            this.setState({ assignment: res });
            this.toggleEdit();
        })
        .fail(() => {
            $.snackbar({ content: 'Could not save assignment!' });
        })
        .always(() => {
            this.setState({ loading: false });
        });
    }

    /**
     * Toggles edit modal
     */
    toggleEdit() {
        this.setState({ editToggled: !this.state.editToggled });
    }

    render() {
        const { user } = this.props;
        const {
            assignment,
            editToggled,
            verifiedToggle,
            loading,
            sortBy,
        } = this.state;

        return (
            <App user={user}>
                <TopBar
                    title={assignment.title}
                    permissions={user.permissions}
                    onVerifiedToggled={(t) => this.onVerifiedToggled(t)}
                    updateSort={(s) => this.updateSort(s)}
                    edit={() => this.toggleEdit()}
                    editable
                    timeToggle
                    chronToggle
                    verifiedToggle
                />

                <Sidebar
                    assignment={assignment}
                    expireAssignment={() => this.expireAssignment()}
                    loading={loading}
                />

                <div className="col-sm-8 tall">
                    <PostList
                        permissions={user.permissions}
                        loadPosts={(l, cb) => this.loadPosts(l, cb)}
                        sortBy={sortBy}
                        onlyVerified={verifiedToggle}
                        assignment={assignment}
                        editable={false}
                        size="large"
                        scrollable
                    />
                </div>

                <Edit
                    assignment={assignment}
                    save={(id, p) => this.save(id, p)}
                    onToggle={() => this.toggleEdit()}
                    updateOutlet={(o) => this.updateOutlet(o)}
                    user={user}
                    loading={loading}
                    visible={editToggled}
                />
            </App>
        );
    }
}

AssignmentDetail.propTypes = {
    user: PropTypes.object,
    assignment: PropTypes.object,
};

ReactDOM.render(
    <AssignmentDetail
        user={window.__initialProps__.user}
        assignment={window.__initialProps__.assignment}
    />,
    document.getElementById('app')
);

