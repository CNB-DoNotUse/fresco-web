import React from 'react';

/** //

Description : The container for the map element in the dispatch page

// **/

/**
 * Dispatch Map component
 */

export default class DispatchMap extends React.Component {

	constructor(props) {
		super(props);
	}

	componentDidMount() {
		
		var styles = [{"featureType": "all", "elementType":"all", "stylers": [{"gamma":1.54}]},
			{"featureType":"road.highway","elementType":"all","stylers":[{"gamma":1.54}]},
			{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#e0e0e0"}]},
			{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#bdbdbd"}]},
			{"featureType":"road.highway","elementType":"labels.text.fill","stylers":[{"color":"#757575"}]},
			{"featureType":"poi.park","elementType":"all","stylers":[{"gamma":1.26}]},
			{"featureType":"poi.park","elementType":"labels.text","stylers":[{"saturation":-54}]}];

	}

	render() {

		return (

			<div class="map-group">
				<div class="map-container full">
					 <div id="map-canvas"></div>
				</div>
			</div>
			
		);
	}

}

