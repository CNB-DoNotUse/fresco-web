import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import utils from 'utils';
import { getFromSessionStorage, setInSessionStorage } from 'app/lib/storage';
import App from './app';
import TopBar from './../components/topbar';
import PostList from './../components/post/list';
import Sidebar from './../components/story/sidebar';
import Edit from './../components/story/edit';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
// import configureStore from 'app/redux/store/immutableStore';
import injectTapEventPlugin from 'react-tap-event-plugin';
import { StoryTitle } from 'app/platform/components/story/story-cell';
import StoriesTopBar from 'app/platform/components/story/topbar';


/**
 * Story Detail Parent Object, made of a side column and PostList
 */

const fillerBody = "When the war ended in 1918, Mondrian returned to France where he would remain until 1938. Immersed in the crucible of artistic innovation that was post-war Paris, he flourished in an atmosphere of intellectual freedom that enabled him to embrace an art of pure abstraction for the rest of his life. Mondrian began producing grid-based paintings in late 1919, and in 1920, the style for which he came to be renowned began to appear. In the early paintings of this style the lines delineating the rectangular forms are relatively thin, and they are gray, not black. The lines also tend to fade as they approach the edge of the painting, rather than stopping abruptly. The forms themselves, smaller and more numerous than in later paintings, are filled with primary colors, black, or gray, and nearly all of them are colored; only a few are left white. Piet Mondriaan abstract painting Composition II in Red, Blue, and Yellow, 1930 Composition II in Red, Blue, and Yellow, 1930 During late 1920 and 1921, Mondrian's paintings arrive at what is to casual observers their definitive and mature form. Thick black lines now separate the forms, which are larger and fewer in number, and more of the forms are left white. This was not the culmination of his artistic evolution, however. Although the refinements became subtler, Mondrian's work continued to evolve during his years in Paris.";

class StoryDetail extends React.Component {
    state = {
        loading: false,
        editToggled: false,
        story: this.props.story,
        sortBy: getFromSessionStorage('topbar', 'sortBy', 'created_at'),
        initialSearchParams: {
            verified: true,
            unverified: false,
            purchased: true,
            notPurchased: false,
            capturedTime: true,
            relativeTime: true,
            location,
            address: '',
            radius: 250,
            searchTerm: '',
            users: {},
            assignments:{},
            tags: {},
            loading: false,
            errors: {},
            params: { users: {}, assignments: {}, tags: {} }
        }
    };

    onChronToggled = (sortBy) => {
        this.setState({ sortBy });
        setInSessionStorage('topbar', { sortBy });
    };

    toggleStoryEdit() {
        this.setState({ editToggled: !this.state.editToggled });
    }

    save(id, params) {
        if (!id || this.state.loading) return;
        if (Object.keys(params).length < 1) {
            $.snackbar({ content: 'No changes made!' });
            return;
        }
        this.setState({ loading: true });

        $.ajax({
            url: `/api/story/${id}/update`,
            method: 'post',
            data: JSON.stringify(params),
            contentType: 'application/json',
            dataType: 'json',
        })
        .done((res) => {
            this.setState({ story: res });
            this.toggleStoryEdit();
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
    loadPosts = (last, callback) => {
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
        }).always(() => {
            callback(story.posts);
        })
        // .done((res) => {
        //     callback(res);
        // })
        // .fail(() => {
        //     $.snackbar({ content: 'Couldn\'t load posts!' });
        //     callback([]);
        // });
    };

    render() {
        const { user } = this.props;
        const { story, sortBy, editToggled, loading, initialSearchParams } = this.state;
        // const { story } = this.props;
        const page = 'storyDetail';
        return (
            <App
                user={user}
                page={page}
            >
                <StoriesTopBar
                    title={`${story.owner.full_name}'s story from New York`}
                    searchParams={ initialSearchParams }
                    onChange={() => {}}/>

                <div className="story-container">
                    <StorySummary
                        title={story.title}
                        body={ fillerBody }/>
                    <StoryTitle
                        owner={ story.owner }
                        storyInfo={{ videos: 0, images: 0, caption: story.title }}/>

                        <PostList
                            loadPosts={this.loadPosts}
                            editable={false}
                            sortBy={sortBy}
                            size="medium"
                            scrollable
                            page={page}
                            user={user}
                        />

                    <Edit
                        onToggle={() => this.toggleStoryEdit()}
                        save={(id, p) => this.save(id, p)}
                        remove={(id) => this.remove(id)}
                        story={story}
                        user={user}
                        loading={loading}
                        visible={editToggled}
                    />
                </div>
            </App>
        );
    }
}

const StorySummary = ({title, body}) => (
    <div className="story-summary">
        <img src="https://68.media.tumblr.com/aad28541ff453dda1cc3351c66d9c145/tumblr_oqkp4m3vT11qans75o1_540.png"></img>
        <section>
            <h2>{title}</h2>
            <p>{body}</p>
        </section>

    </div>
)

StoryDetail.propTypes = {
    story: PropTypes.object,
    user: PropTypes.object,
};

ReactDOM.render(
  	<StoryDetail
  		user={window.__initialProps__.user}
  		purchases={window.__initialProps__.purchases}
  		story={window.__initialProps__.story}
  		title={window.__initialProps__.title} />,
  	document.getElementById('app')
);
