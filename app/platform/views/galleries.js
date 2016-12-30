import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { getFromSessionStorage, setInSessionStorage } from 'app/lib/storage';
import App from './app';
import GalleryList from '../components/global/gallery-list';
import TopBar from '../components/topbar';
import TagFilter from '../components/topbar/tag-filter';
import LocationDropdown from '../components/topbar/location-dropdown';

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
    };

    onVerifiedToggled = (verifiedToggle) => {
        this.setState({ verifiedToggle });
        setInSessionStorage('topbar', { verifiedToggle });
    }

    /**
     * Called on Location dropdown state changes
     */
    onChangeLocation = (location) => {
        this.setState({ location});
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
        const { verifiedToggle, location, tags } = this.state;
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

                <GalleryList
                    withList={false}
                    highlighted={false}
                    onlyVerified={verifiedToggle}
                    location={location}
                    tags={tags}
                />
            </App>
        );
    }

}

ReactDOM.render(
    <Galleries user={window.__initialProps__.user} />,
    document.getElementById('app')
);

