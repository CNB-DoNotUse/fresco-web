import React, { PropTypes } from 'react';
import RelatedPostImage from './related-image';

// TODO: Figure out how to combine this and PostRelatedTags into a single reusable component
/**
 * PostRelated
 * Related posts at the bottom of the PostDetail view
 * @description Contains set of all other posts in the parent gallery
 */
export default class PostRelated extends React.Component {
    static propTypes = {
        gallery: PropTypes.object,
    };

    constructor(props) {
        super(props);
        if (this.props.gallery.posts.length > 1) {
            this.state.stories.gallery = this.props.gallery.posts;
            this.state.selectedTab = 'gallery';
        } else if (this.props.gallery.stories.length > 0) {
            this.state.selectedTab = this.props.gallery.stories[0].id;
        }
    }

    state = {
        stories: {},
        selectedTab: '',
    };

    componentDidMount() {
        this.getStories();
    }

    getStories = () => {
        var stories = this.props.gallery.stories,
            stories = this.state.stories,
            self = this;

        for (var i = 0; i < stories.length; i++) {
            var story = stories[i];

            $.ajax({
                url: '/api/story/posts',
                data: {
                    id: story.id,
                    limit: 10
                },
                key: i,
                count: stories.length,
                type: 'GET',
                success: function(response, status, xhr) {
                    if (!response.err && response.data) {
                        stories[stories[this.key].id] = response.data;
                    }

                    //Wait till end of loop to update the state
                    if(this.key === (this.count - 1)) {
                        updateStories();
                    }
                }
            });
		}

        //Update the state through function after ajax calls are finished
        function updateStories() {
            self.setState({
                stories: stories
            });
        }
    };

    setDisplayedTab = (event) => {
        if (this.state.selectedTab === event.currentTarget.dataset.tab) {
            return;
        }
        this.setState({
            selectedTab: event.currentTarget.dataset.tab
        });
    };

    render() {
        let tabs = [];
        let tabControls = [];

        if (this.state.stories.gallery) {
            let posts = this.state.stories.gallery.map((post, i) => {
                return <RelatedPostImage post={post} key={i}/>
            });

            let toggled = this.state.selectedTab === 'gallery' ? 'toggled' : '';

            tabs.push(
                <div className={"tab " + toggled} key="gallery">
                    <div className="tab-inner">
                        <a className="btn btn-flat" href={"/gallery/" + this.props.gallery.id}>See all</a>
                        {posts}
                    </div>
                </div>
            );

            tabControls.push(
                <button
                    className={"btn btn-flat " + toggled}
                    key="gallery"
                    onClick={this.setDisplayedTab}
                    data-tab="gallery">More from this gallery</button>
            );
        }

        for (let story of this.props.gallery.stories) {
            if (!this.state.stories[story.id]) {
                break;
            }

            let posts = this.state.stories[story.id].map((post, i) => {
                return <RelatedPostImage post={post} key={i}/>
            });

            let toggled = this.state.selectedTab === story.id ? 'toggled' : '';

            tabs.push(
                <div className={"tab " + toggled} key={story.id}>
                    <div className="tab-inner">
                        <a className="btn btn-flat" href={"/story/" + story.id}>See all</a>
                        {posts}
                    </div>
                </div>
            );

            tabControls.push(
                <button
                    className={"btn btn-flat " + toggled}
                    key={story.id}
                    onClick={this.setDisplayedTab}
                    data-tab={story.id}>{story.title.toUpperCase()}</button>
            );
        }

        return (
            <div className="row related hidden-xs">
                <div className="tab-control">
                    {tabControls}
                </div>
                <div className="tabs">
                    {tabs}
                </div>
            </div>
        );
    }
}
