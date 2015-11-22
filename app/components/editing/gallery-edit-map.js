import React from 'react'
import EditMap from './edit-map.js'

/**
 * Component for managing gallery map representation
 */

export default class GalleryEditMap extends React.Component {

	//Configure google maps after component mounts
	componentDidMount() {

		//Set up autocomplete listener
		var autocomplete = new google.maps.places.Autocomplete(document.getElementById('gallery-location-input'));
				
		google.maps.event.addListener(autocomplete, 'place_changed', () => {

			var place = autocomplete.getPlace();

			if(place.geometry){
				
				marker.setPosition(place.geometry.location);

				if(place.geometry.viewport) {
					map.fitBounds(place.geometry.viewport);
				}
				else {
					map.panTo(place.geometry.location);
					map.setZoom(18);
				}
			}

		});

	}

	render() {

		return (

				<div className="dialog-col col-xs-12 col-md-5 pull-right">
					<div className="dialog-row map-group">
						<div className="form-group-default">
							<input 
								id="gallery-location-input" 
								type="text" className="form-control floating-label" 
								placeholder="Location"
								defaultValue={this.props.gallery.posts[0].location.address}
								disabled={!this.props.gallery.imported} />
						</div>
						<EditMap gallery={this.props.gallery} />
					</div>
				</div>

		);

	}
}