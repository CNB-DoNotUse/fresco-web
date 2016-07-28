import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import TopBar from './../components/topbar';
import PostList from './../components/global/post-list';
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
            editToggled: false,
            story: props.story,
            sort: props.sort,
        };
    }

    updateStory(story) {
        this.setState({ story });
    }

    toggleStoryEdit() {
        this.setState({ editToggled: !this.state.editToggled});
    }

    updateSort(sort) {
        this.setState({ sort });
    }

    /**
     * Returns array of posts with offset and callback, used in child PostList
     * @param {string} lastId Last post in the list
     * @param {function} callback callback delivering posts
     */
    loadPosts(lastId, callback) {
        const { story, sort } = this.state;
        const params = {
            lastId,
            limit: 10,
            sort,
        };

        $.ajax({
            url: `/api/story/${story.id}`,
            type: 'GET',
            data: JSON.stringify(params),
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
        const { story, sort, editToggled } = this.state;

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

                <Sidebar story={story} />

                <div className="col-sm-8 tall">
                    <PostList
                        rank={user.rank}
                        loadPosts={(id, cb) => this.loadPosts(id, cb)}
                        editable={false}
                        sort={sort}
                        size="large"
                        scrollable
                    />
                </div>

                {editToggled
                    ? <Edit
                        onToggle={() => this.toggleStoryEdit()}
                        story={story}
                        user={user}
                        onUpdateStory={(s) => this.updateStory(s)}
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
    sort: PropTypes.string,
};

StoryDetail.defaultProps = {
    sort: 'created_at',
};

ReactDOM.render(
  	<StoryDetail
  		user={window.__initialProps__.user}
  		purchases={window.__initialProps__.purchases}
  		story={window.__initialProps__.story}
  		title={window.__initialProps__.title} />,
  	document.getElementById('app')
);

