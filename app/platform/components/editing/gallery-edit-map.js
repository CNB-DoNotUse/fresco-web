import React from 'react';
import AutocompleteMap from '../global/autocomplete-map';

/**
 * Component for managing gallery map representation
 */

export default class GalleryEditMap extends React.Component {

    render() {
        const { gallery, onPlaceChange } = this.props;
        let location = null;
        let defaultLocation = '';

        if (gallery.location) {
            location = gallery.location.coordinates
            ? gallery.location.coordinates[0]
            : gallery.location;
        }

        if (gallery.address) {
            defaultLocation = gallery.address;
        } else if (gallery.posts[0].location) {
            defaultLocation = gallery.posts[0].location.address;
        } else {
            defaultLocation = null;
        }

        if (Array.isArray(location)) {
            if (!location[0].lat) {
                location = location.map((loc) => (
                    { lat: loc[1], lng: loc[0] }
                ));
            }
        }

        return (
            <div className="dialog-col col-xs-12 col-md-5 pull-right">
                <AutocompleteMap
                    defaultLocation={defaultLocation}
                    location={location}
                    hasRadius={false}
                    onPlaceChange={onPlaceChange}
                    disabled={gallery.owner}
                    rerender
                />
            </div>
        );
    }
}

