import React, { PropTypes } from 'react';
import ChipInput from './chip-input';
import { geoParams } from 'app/lib/location';
import assignment from 'app/lib/assignment';

/**
 * Assignment Chip Input. Implements a regular chip input with some extended functionality
 * to autofill suggested assignments
 *
 * @extends React.Component
 */
class AssignmentChipInput extends React.Component {

    static propTypes = {
        locationHint: PropTypes.object
    };

    static defaultProps = {
        locationHint: null
    };

    /**
     * Gets initial suggestions for the chip inputs. Uses locationHint
     * to search for nearby assignments
     */
    getInitialSuggestions = (callback) => {
        const { locationHint } = this.props;
        let lat, lng;

        if(locationHint.type === 'MultiPoint' && locationHint.coordinates.length > 0) {
            lng = locationHint.coordinates[0][0];
            lat = locationHint.coordinates[0][1];
            fetchSuggestions(lat, lng, callback);
        } else if(locationHint.type === 'Point') {
            lng = locationHint.coordinates[0];
            lat = locationHint.coordinates[1];
            fetchSuggestions(lat, lng, callback);
        }

        function fetchSuggestions(lat, lng, callback) {        
            const params = {
                limit: 15,
                ...geoParams({ lat, lng, radius: 52800 })
            };

            assignment
            .list(params, 'active')
            .then(callback);
        }
    };

    render() {
        const { locationHint } = this.props;
        return (
            <ChipInput
                suggestionText="Nearby assignments"
                initialSuggestions={locationHint !== null ? this.getInitialSuggestions : null}
                params={{ rating: 1, sortBy: 'created_at', direction: 'asc' }}
                {...this.props} />
        );
    }
}

export default AssignmentChipInput;
