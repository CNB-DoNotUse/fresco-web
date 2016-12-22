export const getAddressFromLatLng = ({ lat, lng }, cb) => {
    if (lat && lng) {
        const geocoder = new google.maps.Geocoder();

        geocoder.geocode({ location: { lat, lng } },
            (results, status) => {
                if (status === google.maps.GeocoderStatus.OK && results[0]) {
                    return cb(results[0].formatted_address);
                }
                return cb('');
            });
    }

    return cb('');
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
