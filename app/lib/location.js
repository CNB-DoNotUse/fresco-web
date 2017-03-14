import utils from 'utils';

export const getAddressFromLatLng = ({ lat, lng }) => {
    return new Promise((resolve) => {
        if (lat && lng) {
            const geocoder = new google.maps.Geocoder();

            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                if (status === google.maps.GeocoderStatus.OK && results[0]) {
                    return resolve(results[0].formatted_address);
                }
                return resolve('');
            });
        } else {
            return resolve('');
        }
    });
};

/**
 * Returns lat lng map from GeoJSON object
 *
 * @param {Array} coordinates Array with lat and lng
 * @param {String} type GeoJSON GeoJSON type
 * @returns {Object} Object with lat lng keys
 */
export const getLatLngFromGeo = ({ coordinates, type }) => {
    if (!coordinates || !type || type.toLowerCase() !== 'point') return null;

    return { lng: coordinates[0], lat: coordinates[1] };
};


export const geoFromCoordinates = (location) => {
    if (!coords || !coords.lat || !coords.lng) return null;

    return {
        type: 'Point',
        coordinates: [coords.lng, coords.lat],
    };
}

/**
 * geoParams
 *
 * @param {Object} {Location object containing lat, lng, and radius keys. Takes radius in feet
 * @returns {Object} Param for geo data
 */
export const geoParams = ({ lat, lng, radius } = {}) => {
    if (lat && lng && radius) {
        return {
            geo: {
                type: 'Point',
                coordinates: [lng, lat],
            },
            radius: utils.feetToMiles(radius),
        };
    }

    return {};
}

