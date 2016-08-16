import React from 'react';
import ReactDOM from 'react-dom';

/**
 * KML Input File selector
 * @description Handles KML parsing, converting to polygon, etc.
 */
class KMLInput extends React.Component {

    //Click event for button that invokes file picker
    kmlClicked() {
        this.refs.kmlFileInput.click();
    }

    /**
     * File input listener
     * @description Takes inputed file and parses as KML for a location polygon
     */
    kmlFileInputChange() {
        const _this = this;
        const file = this.refs.kmlFileInput.files[0];
        const reader = new FileReader();

        //Check if a KML file
        if(file.name.indexOf('kml') == -1) {
            return $.snackbar({content: 'Please upload a KML file!'});
        }

        reader.onload = () => {
            //Parse KML file
            const kml = new DOMParser().parseFromString(reader.result, "text/xml");
            let pointArray = '';

            try {
                pointArray = kml
                .getElementsByTagName("Polygon")[0]
                .getElementsByTagName("outerBoundaryIs")[0]
                .getElementsByTagName("coordinates")[0]
                .innerHTML.split(" ");
            } catch(e) {
                return $.snackbar({content: 'There was an error reading this file!'});
            }

            //Map into coordinates array by parsing string
            const coordinates = pointArray.map((str) => {
                return [
                    str.substring(0, str.indexOf(',')),
                    str.substring(str.indexOf(',') + 1, str.length)
                ]
            });

            handleCoordinates(coordinates);
        };

        reader.readAsText(file);

        //Take coordinates and send to rest of component to update
        function handleCoordinates(coordinates) {
            let bounds = new google.maps.LatLngBounds();
            const latLngArray = coordinates.map((latLng) => {
                latLng = new google.maps.LatLng(latLng[1], latLng[0]);
                //Extend bounds each time
                bounds.extend(latLng);  
                return latLng;
            });

            _this.props.updateCoordinates({ coordinates })
            _this.props.updatePolygon(latLngArray);
            _this.props.updateMap(bounds);
        }
    }

    render() {
        return (
            <div>
                <button 
                    className="btn btn-flat pull-right mt12 mr16 kml" 
                    onClick={() => this.kmlClicked()}>Upload a KML file
                </button>

                <input 
                    onChange={() => this.kmlFileInputChange()} 
                    type="file"
                    accept="text/kml" 
                    ref="kmlFileInput" />
            </div>
        )
    }
}

export default KMLInput;