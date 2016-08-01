import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import TopBar from './../components/topbar';
import PostList from './../components/global/post-list';
import Sidebar from './../components/assignment/sidebar';
import Edit from './../components/assignment/edit.js';
import App from './app';
import utils from 'utils';
import 'app/sass/platform/_assignment';

/**
 * Story Detail Parent Object, made of a side column and PostList
 */
class AssignmentDetail extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            assignment: this.props.assignment,
            editToggled: false,
            verifiedToggle: true,
            sortBy: 'created_at',
            loading: false,
        };

        this.loadPosts = this.loadPosts.bind(this);
    }

    onVerifiedToggled(verifiedToggle) {
        this.setState({ verifiedToggle });
    }

    updateSort(sortBy) {
        this.setState({ sortBy });
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
        };

        if (verifiedToggle) {
            params.rating = [1];
        }

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
            sortBy
        } = this.state;

        return (
            <App user={user}>
                <TopBar
                    title={assignment.title}
                    rank={user.rank}
                    onVerifiedToggled={(t) => this.onVerifiedToggled(t)}
                    updateSort={(s) => this.updateSort(s)}
                    verifiedToggle={user.rank >= utils.RANKS.CONTENT_MANAGER}
                    edit={() => this.toggleEdit()}
                    editable
                    timeToggle
                    chronToggle
                />

                <Sidebar
                    assignment={assignment}
                    expireAssignment={() => this.expireAssignment()}
                />

                <div className="col-sm-8 tall">
                    <PostList
                        rank={user.rank}
                        loadPosts={this.loadPosts}
                        sortBy={sortBy}
                        onlyVerified={verifiedToggle}
                        assignment={assignment}
                        scrollable={true}
                        editable={false}
                        size="large"
                    />
                </div>

                {editToggled
                    ? <Edit
                        assignment={assignment}
                        save={(id, p) => this.save(id, p)}
                        onToggle={() => this.toggleEdit()}
                        updateOutlet={(o) => this.updateOutlet(o)}
                        user={user}
                        loading={loading}
                    />
                    : ''
                }
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

