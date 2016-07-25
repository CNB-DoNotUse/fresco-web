import React, { PropTypes } from 'react';
import AutocompleteMap from '../global/autocomplete-map';

/**
 * Component for managing gallery map representation
 */

class EditMap extends React.Component {
    render() {
        const { gallery, onPlaceChange, disabled } = this.props;
        let defaultLocation = '';

        if (gallery.address) {
            defaultLocation = gallery.address;
        } else if (gallery.posts[0].location) {
            defaultLocation = gallery.posts[0].location.address;
        } else {
            defaultLocation = null;
        }

        return (
            <div className="dialog-col col-xs-12 col-md-5 pull-right">
                <AutocompleteMap
                    defaultLocation={defaultLocation}
                    location={gallery.location}
                    hasRadius={false}
                    onPlaceChange={onPlaceChange}
                    disabled={disabled}
                    rerender
                />
            </div>
        );
    }
}

EditMap.propTypes = {
    gallery: PropTypes.object,
    onPlaceChange: PropTypes.func,
    disabled: PropTypes.bool,
};

EditMap.defaultProps = {
    disabled: true,
};

export default EditMap;
