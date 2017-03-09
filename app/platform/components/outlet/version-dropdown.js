import React, { PropTypes } from 'react';
import time from 'app/lib/time';
import Dropdown from '../global/dropdown';

/**
 * Dropdown component for managing versions
 */
export default class VersionDropdown extends React.Component {
    static propTypes = {
        versions: PropTypes.array,
        selectedVersion: PropTypes.object
    }

    state = {}

    componentWillReceiveProps(nextProps) {
        //Incoming new client, or client state change
        if((nextProps.selectedVersion && !this.props.selectedVersion) 
            || (nextProps.selectedVersion && (nextProps.selectedVersion.id !== this.props.selectedVersion.id))) {
            this.setState({ active: false })
        }
    }

    render() {
        const { versions, selectedVersion, versionSelected } = this.props;
        const title = selectedVersion ? `Version ${selectedVersion.version_major}.${selectedVersion.version_minor}` : 'API Version';

        return (
            <Dropdown
                title={title}
                dropdownClass="dialog-modal__token-dropdown"
            >
                <ul className="list">
                    {versions.map((version, i) => {
                        return (
                            <li
                                className="version-item"
                                key={i}
                                onClick={() => versionSelected(version)}
                            >
                                <span className="version-item__version">Version {`${version.version_major}.${version.version_minor}`}</span>
                                <span className="version-item__released">Released {time.formatTime(version.deployed_at, true, 'YYYY/MM/D')}</span>
                            </li>
                        );
                    })}
                </ul>
            </Dropdown>
        )        
    }
}