import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import TopBar from '../components/topbar';
import StoryList from '../components/global/story-list';
import LocationDropdown from '../components/topbar/location-dropdown';
import TagFilter from '../components/topbar/tag-filter';
import { getFromSessionStorage, setInSessionStorage } from 'app/lib/storage';
import { geoParams } from 'app/lib/location';
import utils from 'utils';

/**
 * Stories Parent Object, contains StoryList composed of StoryCells
 */
class Stories extends React.Component {
    static propTypes = {
        user: PropTypes.object,
    }

    state = {
        location: getFromSessionStorage('archive', 'location', {}),
        tags: getFromSessionStorage('archive', 'tags', []),
        reloadStories: false,
    }

    /**
     * Called on Location dropdown state changes
     */
    onChangeLocation = (location) => {
        this.setState({ location, reloadStories: true });
        setInSessionStorage('archive', { location });
    }

    onAddTag = (tag) => {
        const tags = this.state.tags.concat(tag);
        this.setState({ tags, reloadStories: true });
        setInSessionStorage('archive', { tags });
    }

    onRemoveTag = (tag) => {
        const tags = this.state.tags.filter(t => t !== tag);
        this.setState({ tags, reloadStories: true });
        setInSessionStorage('archive', { tags });
    }

    /**
     * Returns array of posts with offset and callback, used in child PostList
     */
    loadStories = (last, callback) => {
        const { location, tags } = this.state;
        const params = {
            last,
            limit: 20,
            sortBy: 'updated_at',
            tags,
            ...geoParams(location),
        };

        $.ajax({
            url: '/api/story/recent',
            type: 'GET',
            data: params,
            dataType: 'json',
            success: (stories) => {
                this.setState({ reloadStories: false }, () => callback(stories));
            },
            error: () => {
                $.snackbar({ content: 'Couldn\'t fetch any stories!' });
            },
        });
    }

    render() {
        const { location, reloadStories, tags } = this.state;
        return (
            <App user={this.props.user} page="stories">
                <TopBar
                    title="Stories"
                    timeToggle
                    tagToggle
                >
                    <TagFilter
                        onTagAdd={this.onAddTag}
                        onTagRemove={this.onRemoveTag}
                        filterList={tags}
                        attr=""
                        key="tagFilter"
                    />
                    <LocationDropdown
                        location={location}
                        units="Miles"
                        key="locationDropdown"
                        onChangeLocation={this.onChangeLocation}
                    />
                </TopBar>

                <StoryList
                    loadStories={this.loadStories}
                    reloadStories={reloadStories}
                    scrollable
                />
            </App>
        );
    }
}

ReactDOM.render(
    <Stories user={window.__initialProps__.user} />,
    document.getElementById('app')
);
