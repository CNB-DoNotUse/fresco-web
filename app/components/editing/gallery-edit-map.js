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

		var location = this.props.gallery.location ? this.props.gallery.location.coordinates ? this.props.gallery.location.coordinates[0] : this.props.gallery.location : null;
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
					defaultLocation={this.props.gallery.posts[0].location ? this.props.gallery.posts[0].location.address : null}
					hasRadius={false}
					location={location}
					onPlaceChange={this.props.onPlaceChange}
					rerender={true} />
			</div>
		);

	}
}