import React, { PropTypes } from 'react';
import { isImportedGallery } from 'app/lib/galleries';
import utils from 'utils';

/**
 * Gallery byline component
 */
class BylineEdit extends React.Component {

    componentDidUpdate(prevProps) {
        if (this.props.gallery.id !== prevProps.gallery.id) {
            $.material.init();
        }
    }

    render() {
        const {
            onChangeExtAccountName,
            onChangeExtSource,
            gallery,
            external_account_name,
            external_source,
            disabled,
        } = this.props;

        if (!isImportedGallery(gallery)) {
            return (
                <div className="dialog-row">
                    <div>
                        <input
                            type="text"
                            className="form-control floating-label"
                            value={utils.getBylineFromGallery(gallery) || ''}
                            placeholder="Byline"
                            disabled
                        />
                    </div>
                </div>
            );
        }

        return (
            <div className="dialog-row split byline-section">
                <div className="split-cell">
                    <input
                        type="text"
                        className="form-control floating-label"
                        value={external_account_name || ''}
                        onChange={(e) => onChangeExtAccountName(e.target.value)}
                        placeholder="Name"
                        disabled={disabled}
                    />
                </div>

                <div className="split-cell">
                    <input
                        type="text"
                        className="form-control floating-label"
                        value={external_source || ''}
                        onChange={(e) => onChangeExtSource(e.target.value)}
                        placeholder="Affiliation"
                        disabled={disabled}
                    />
                </div>
            </div>
        );
    }
}

BylineEdit.propTypes = {
    gallery: PropTypes.object.isRequired,
    onChangeExtAccountName: PropTypes.func.isRequired,
    onChangeExtSource: PropTypes.func.isRequired,
    external_account_name: PropTypes.string,
    external_source: PropTypes.string,
    disabled: PropTypes.bool,
};

BylineEdit.defaultProps = {
    external_source: '',
    external_account_name: '',
    disabled: false,
};

export default BylineEdit;
