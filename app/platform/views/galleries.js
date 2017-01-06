import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { getFromSessionStorage, setInSessionStorage } from 'app/lib/storage';
import App from './app';
import List from '../components/gallery/list';
import TopBar from '../components/topbar';
import TagFilter from '../components/topbar/tag-filter';
import LocationDropdown from '../components/topbar/location-dropdown';
import { geoParams } from 'app/lib/location';
import isEqual from 'lodash/isEqual';
import get from 'lodash/get';
import api from 'app/lib/api';

/**
 * Galleries Parent Cmp (composed of GalleryList and Navbar)
 */
class Galleries extends React.Component {
    static propTypes = {
        user: PropTypes.object,
    };

    state = {
        verifiedToggle: getFromSessionStorage('topbar', 'verifiedToggle', true),
        location: getFromSessionStorage('archive', 'location', {}),
        tags: getFromSessionStorage('archive', 'tags', []),
        galleries: [],
        loading: false,
    };

    componentDidMount() {
        this.loadInitialGalleries();
    }

    componentDidUpdate(prevProps, prevState) {
        const { tags, location, verifiedToggle } = this.state;
        const newLocation = !isEqual(prevState.location, location);
        const newTags = !isEqual(prevState.tags, tags);
        const verifiedChanged = prevState.verifiedToggle !== verifiedToggle;
        if (newLocation || newTags || verifiedChanged) this.loadInitialGalleries();
    }

    // Scroll listener for main window
    onScroll = (e) => {
        const grid = e.target;
        const bottomReached = grid.scrollTop > ((grid.scrollHeight - grid.offsetHeight) - 400);

        if (!this.state.loading && bottomReached) {
            const lastGallery = this.state.galleries[this.state.galleries.length - 1];
            if (!lastGallery) return;
            this.setState({ loading: true });

            this.loadGalleries(lastGallery.id, (galleries) => {
                if (!galleries) return;

                // Set galleries from successful response
                this.setState({
                    galleries: this.state.galleries.concat(galleries),
                    loading: false,
                });
            });
        }
    }

    loadInitialGalleries = () => {
        this.setState({ galleries: [] }, () => {
            this.loadGalleries(null, (galleries) => {
                this.list.grid.scrollTop = 0;
                this.setState({ galleries });
            });
        });
    }

    // Returns array of galleries with offset and callback
    loadGalleries = (last, callback) => {
        const { tags, verifiedToggle, location } = this.state;
        const params = {
            limit: 20,
            last,
            tags,
            ...geoParams(location),
            galleries: true,
        };

        if (verifiedToggle) params.rating = 2;
        else params.rating = [0, 1, 2];

        api
        .get('search', params)
        .then((res) => {
            callback(get(res, 'galleries.results', []));
        })
        .catch(() => {
            $.snackbar({ content: 'Failed to load galleries' });
        });
    }

    onVerifiedToggled = (verifiedToggle) => {
        this.setState({ verifiedToggle });
        setInSessionStorage('topbar', { verifiedToggle });
    }

    /**
     * Called on Location dropdown state changes
     */
    onChangeLocation = (location) => {
        this.setState({ location });
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

    render() {
        const { verifiedToggle, location, tags, galleries } = this.state;
        const { user } = this.props;

        return (
            <App user={this.props.user} page="galleries">
                <TopBar
                    title="Galleries"
                    permissions={user.permissions}
                    onVerifiedToggled={this.onVerifiedToggled}
                    defaultVerified={verifiedToggle}
                    timeToggle
                    verifiedToggle
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

                <List
                    ref={(r) => { this.list = r; }}
                    galleries={galleries}
                    withList={false}
                    onScroll={this.onScroll}
                />
            </App>
        );
    }
}

ReactDOM.render(
    <Galleries user={window.__initialProps__.user} />,
    document.getElementById('app')
);

