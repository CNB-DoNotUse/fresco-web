import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import TopBar from './../components/topbar';
import PostList from './../components/post/list';
import Sidebar from './../components/story/sidebar';
import Edit from './../components/story/edit';
import utils from 'utils';

/**
 * Story Detail Parent Object, made of a side column and PostList
 */
class StoryDetail extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            editToggled: false,
            story: props.story,
            sortBy: props.sortBy,
        };

        this.loadPosts = this.loadPosts.bind(this);
    }

    toggleStoryEdit() {
        this.setState({ editToggled: !this.state.editToggled});
    }

    updateSort(sortBy) {
        this.setState({ sortBy });
    }

    save(id, params) {
        if (!id || !params || this.state.loading) return;
        this.setState({ loading: true });

        $.ajax({
            url: `/api/story/${id}/update`,
            method: 'post',
            data: JSON.stringify(params),
            contentType: 'application/json',
            dataType: 'json',
        })
        .done((res) => {
            this.hide();
            this.setState({ story: res });
        })
        .fail(() => {
            $.snackbar({ content: 'Unable to save story' });
        })
        .always(() => {
            this.setState({ loading: false });
        });
    }

    remove(id) {
        if (!id || this.state.loading) return;

        alertify.confirm('Are you sure you want to delete this story? This cannot be undone.', (confirmed) => {
            if (!confirmed) return;
            this.setState({ loading: true });

            $.ajax({
                url: `/api/story/${id}/delete`,
                method: 'POST',
                dataType: 'json',
                contentType: 'application/json',
            })
            .done(() => {
                $.snackbar({ content: 'Story deleted' });
                location.href = document.referrer || '/archive/stories';
            })
            .fail(() => {
                $.snackbar({ content: 'Unable to delete gallery' });
            })
            .always(() => {
                this.setState({ loading: false });
            });
        });
    }

    /**
     * Returns array of posts with offset and callback, used in child PostList
     * @param {string} lastId Last post in the list
     * @param {function} callback callback delivering posts
     */
    loadPosts(last, callback) {
        const { story, sortBy } = this.state;
        const params = {
            last,
            sortBy,
            limit: 10,
        };

        $.ajax({
            url: `/api/story/${story.id}/posts`,
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

    render() {
        const { user } = this.props;
        const { story, sortBy, editToggled, loading } = this.state;

        return (
            <App user={user}>
                <TopBar
                    title={story.title}
                    updateSort={(s) => this.updateSort(s)}
                    edit={() => this.toggleStoryEdit()}
                    editable
                    timeToggle
                    chronToggle
                />

                <Sidebar
                    story={story} />

                <div className="col-sm-8 tall">
                    <PostList
                        permissions={user.permissions}
                        loadPosts={this.loadPosts}
                        editable={false}
                        sortBy={sortBy}
                        size="large"
                        scrollable={true}
                    />
                </div>

                {editToggled
                    ? <Edit
                        onToggle={() => this.toggleStoryEdit()}
                        save={(id, p) => this.save(id, p)}
                        remove={(id) => this.remove(id)}
                        story={story}
                        user={user}
                        loading={loading}
                    />
                    : ''
                }
            </App>
        );
    }
}

StoryDetail.propTypes = {
    story: PropTypes.object,
    user: PropTypes.object,
    sortBy: PropTypes.string,
};

StoryDetail.defaultProps = {
    sortBy: 'created_at',
};

ReactDOM.render(
  	<StoryDetail
  		user={window.__initialProps__.user}
  		purchases={window.__initialProps__.purchases}
  		story={window.__initialProps__.story}
  		title={window.__initialProps__.title} />,
  	document.getElementById('app')
);

