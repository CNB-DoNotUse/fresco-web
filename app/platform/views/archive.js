import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import utils from 'utils';
import api from 'app/lib/api';
import { getFromSessionStorage, setInSessionStorage } from 'app/lib/storage';
import { geoParams } from 'app/lib/location';
import App from './app';
import PostList from '../components/post/list';
import TopBar from '../components/topbar';
import LocationDropdown from '../components/topbar/location-dropdown';

/**
 * Archive Parent Object (composed of PostList and Navbar)
 * @description View page for all content
 */
class Archive extends React.Component {
    static propTypes = {
        title: PropTypes.string,
        user: PropTypes.object,
    };

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
            sortBy: this.state.sortBy,
            rating: [0, 1, 2],
            ...geoParams(this.state.location),
        };

        if (this.state.verifiedToggle) {
            params.rating = [2];
        }

        api
        .get('post/list', params)
        .then((res) => {
            this.setState({ reloadPosts: false }, () => callback(res));
        })
        .catch(() => {
            $.snackbar({ content: 'We\'re unable to load the archive right now!' });
            callback([]);
        });
    }

    render() {
        const { verifiedToggle, sortBy, reloadPosts, location } = this.state;
        const { user, title } = this.props;
        return (
            <App
                user={user}
                page="archive"
            >
                <TopBar
                    title={title}
                    permissions={user.permissions}
                    onVerifiedToggled={this.onVerifiedToggled}
                    defaultVerified={verifiedToggle}
                    onChronToggled={this.onChronToggled}
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
                    loadPosts={this.loadPosts}
                    permissions={user.permissions}
                    sortBy={sortBy}
                    size="small"
                    onlyVerified={verifiedToggle}
                    reloadPosts={reloadPosts}
                    scrollable
                />
            </App>
        );
    }
}

ReactDOM.render(
    <Archive
        user={window.__initialProps__.user}
        title={window.__initialProps__.title}
    />,
    document.getElementById('app')
);
