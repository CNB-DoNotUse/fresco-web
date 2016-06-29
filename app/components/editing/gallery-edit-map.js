import React from 'react'
import AutocompleteMap from '../global/autocomplete-map'

/**
 * Component for managing gallery map representation
 */

export default class GalleryEditMap extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {
        let location = this.props.gallery.location
        ? this.props.gallery.location.coordinates
        ? this.props.gallery.location.coordinates[0]
        : this.props.gallery.location : null;

        let defaultLocation = '';

		if(this.props.gallery.address) {
			defaultLocation = this.props.gallery.address;
		} else if(this.props.gallery.posts[0].location) {
			defaultLocation = this.props.gallery.posts[0].location.address
		} else {
			defaultLocation = null;
		}

		if(Array.isArray(location)) {
			if(!location[0].lat) {
				location = location.map((loc) => {
					return {
						lat: loc[1],
						lng: loc[0]
					}
				});
			}
		}

		return (
			<div className="dialog-col col-xs-12 col-md-5 pull-right">
                <AutocompleteMap
                    defaultLocation={defaultLocation}
                    location={location}
                    hasRadius={false}
                    onPlaceChange={this.props.onPlaceChange}
                    disabled={this.props.gallery.owner}
                    rerender={true}
                />
			</div>
		);
	}
}
