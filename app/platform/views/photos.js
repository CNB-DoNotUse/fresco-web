import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import utils from 'utils';
import api from 'app/lib/api';
import { getFromSessionStorage, setInSessionStorage } from 'app/lib/storage';
import { geoParams } from 'app/lib/location';
import App from './app';
import PostList from './../components/post/list';
import TopBar from './../components/topbar';
import LocationDropdown from '../components/topbar/location-dropdown';

/**
 * Photos Parent Object (composed of PhotoList and Navbar)
 */
class Photos extends React.Component {
    static propTypes = {
        user: PropTypes.object,
    }

    state = {
        verifiedToggle: getFromSessionStorage('topbar', 'verifiedToggle', true),
        sortBy: getFromSessionStorage('topbar', 'sortBy', 'created_at'),
        location: getFromSessionStorage('archive', 'location', {}),
        reloadPosts: false,
    };

    onVerifiedToggled = (verifiedToggle) => {
        this.setState({ verifiedToggle });
        setInSessionStorage('topbar', { verifiedToggle });
    }

    onChronToggled = (sortBy) => {
        this.setState({ sortBy });
        setInSessionStorage('topbar', { sortBy });
    }

    /**
     * Called on Location dropdown state changes
     */
    onLocationChange = (location) => {
        this.setState({ location, reloadPosts: true });
        setInSessionStorage('archive', { location });
    }

    // Returns array of posts with last and callback, used in child PostList
    loadPosts = (last, callback) => {
        const params = {
            last,
            limit: utils.postCount,
            type: 'photo',
            sortBy: this.state.sortBy,
            rating: [0, 1, 2],
            ...geoParams(this.state.location),
        };

        if (this.state.verifiedToggle) {
            params.rating = 2;
        }

        api
        .get('post/list', params)
        .then(callback)
        .catch(() => {
            $.snackbar({ content: 'Failed to load posts' });
            callback([]);
        });
    }

    render() {
        const { user } = this.props;
        const { sortBy, verifiedToggle, location, reloadPosts } = this.state;

        return (
            <App
                user={user}
                page="photos"
            >
                <TopBar
                    title="Photos"
                    permissions={user.permissions}
                    onChronToggled={this.onChronToggled}
                    onVerifiedToggled={this.onVerifiedToggled}
                    defaultVerified={verifiedToggle}
                    defaultChron={sortBy}
                    chronToggle
                    timeToggle
                    verifiedToggle
                >
                    <LocationDropdown
                        location={location}
                        units="Miles"
                        key="locationDropdown"
                        onLocationChange={this.onLocationChange}
                    />
                </TopBar>
                <PostList
                    permissions={user.permissions}
                    size="small"
                    sortBy={sortBy}
                    onlyVerified={verifiedToggle}
                    loadPosts={this.loadPosts}
                    reloadPosts={reloadPosts}
                    scrollable
                />
            </App>
        );
    }
}


ReactDOM.render(
    <Photos user={window.__initialProps__.user} />,
    document.getElementById('app')
);
