import utils from 'utils';

/**
 * geoParams
 *
 * @param {Object} {Location object containing lat, lng, and radius keys
 * @returns {Object} Param for geo data
 */
export const geoParams = ({ lat, lng, radius }) => {
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
