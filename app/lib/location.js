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
