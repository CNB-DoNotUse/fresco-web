import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import TopBar from '../components/topbar';
import StoryList from '../components/global/story-list';
import LocationDropdown from '../components/topbar/location-dropdown';
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
        reloadStories: false,
    }

    /**
     * Called on Location dropdown state changes
     */
    onChangeLocation = (location) => {
        this.setState({ location, reloadStories: true });
        setInSessionStorage('archive', { location });
    }

    /**
     * Returns array of posts with offset and callback, used in child PostList
     */
    loadStories = (last, callback) => {
        const params = {
            last,
            limit: 20,
            sortBy: 'updated_at',
            ...geoParams(this.state.location),
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
        return (
            <App user={this.props.user} page="stories">
                <TopBar
                    title="Stories"
                    timeToggle
                    tagToggle
                >
                    <LocationDropdown
                        location={this.state.location}
                        units="Miles"
                        key="locationDropdown"
                        onChangeLocation={this.onChangeLocation}
                    />
                </TopBar>

                <StoryList
                    loadStories={this.loadStories}
                    reloadStories={this.state.reloadStories}
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
