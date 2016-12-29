import React, { PropTypes } from 'react';
import utils from 'utils';
import api from 'app/lib/api';
import { getFromSessionStorage, setInSessionStorage } from 'app/lib/storage';
import { geoParams } from 'app/lib/location';
import App from 'app/platform/views/app';
import PostList from '../post/list';
import TopBar from '../topbar';
import LocationDropdown from '../topbar/location-dropdown';

/**
 * Archive Component (composed of PostList and Navbar)
 * @description View page for different types of content
 */
class Posts extends React.Component {
    static propTypes = {
        user: PropTypes.object,
        type: PropTypes.oneOf(['photo', 'video', null]),
        page: PropTypes.oneOf(['photos', 'video', 'archive']),
        title: PropTypes.oneOf(['Archive', 'Photos', 'Videos']),
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
        const { type } = this.props;
        const params = {
            last,
            limit: utils.postCount,
            sortBy: this.state.sortBy,
            rating: [0, 1, 2],
            ...geoParams(this.state.location),
            type,
        };

        if (this.state.verifiedToggle) {
            params.rating = 2;
        }

        api
        .get('post/list', params)
        .then((res) => {
            this.setState({ reloadPosts: false }, () => callback(res));
        })
        .catch(() => {
            $.snackbar({ content: `Failed to load ${type}s` });
            callback([]);
        });
    }

    render() {
        const { user, title, page } = this.props;
        const { sortBy, verifiedToggle, location, reloadPosts } = this.state;

        return (
            <App user={user} page={page}>
                <TopBar
                    title={title}
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

export default Posts;
