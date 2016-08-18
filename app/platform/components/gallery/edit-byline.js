import React, { PropTypes } from 'react';
import utils from 'utils';

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
        } = this.props;

        if (!utils.isImportedGallery(gallery) || !utils.isOriginalGallery(gallery)) {
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
                    />
                </div>

                <div className="split-cell">
                    <input
                        type="text"
                        className="form-control floating-label"
                        value={external_source || ''}
                        onChange={(e) => onChangeExtSource(e.target.value)}
                        placeholder="Affiliation"
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
};

BylineEdit.defaultProps = {
    external_source: '',
    external_account_name: '',
};

export default BylineEdit;

