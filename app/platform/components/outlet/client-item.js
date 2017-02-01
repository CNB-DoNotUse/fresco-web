import React, { PropTypes } from 'react';
import utils from 'utils';

/**
 * Individual client item in the client list
 */
export default class ClientItem extends React.Component {
    static propTypes = {
        enabled: PropTypes.bool,
        updateClient: PropTypes.func,
        toggleEdit: PropTypes.func,
        client: PropTypes.object.isRequired
    }

    state = {
        editable: false,
        enabled: this.props.client.enabled
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.client.enabled !== this.state.enabled) {
            this.setState({ enabled: nextProps.client.enabled })
        }
    }

    isEditable = (editable) => {
        this.setState({ editable });
    }

    /**
     * Toggles enabled state of the component, subsequently updates client
     * @param  {String} id ID of the client
     */
    toggleEnabled = (id) => {
        const enabled = !this.state.enabled;
        this.setState({ enabled })
        this.props.updateClient(id, { enabled })
    }


    render() {
        const { client, toggleEdit } = this.props;
        const { tag, api_version, last_used_at, id } = client;
        const versionNumber = `${api_version.version_major}.${api_version.version_minor}`;

        return (
            <div 
                className="client-item" 
                onMouseEnter={() => this.isEditable(true)} 
                onMouseLeave={() => this.isEditable(false)}
            >
                <div className="client-item__toggle togglebutton">
                  <label>
                    <input 
                        onChange={(e) => this.toggleEnabled(id)}
                        type="checkbox" 
                        checked={this.state.enabled ? 'true' : ''} 
                    />
                  </label>
                </div>

                <div className="client-item__info">
                    <h3 className="client-item__tag">{tag || 'No tag'}</h3>

                    <i 
                        className={`mdi mdi-pencil mdi-18px client-item__edit ${this.state.editable ? 'toggled' : ''}`}
                        onClick={() => toggleEdit(client)} />
                    
                    <p className="client-item__meta">
                        <span>Version {versionNumber} • </span>
                        <span>Last active {utils.formatTime(last_used_at, true)}</span>
                    </p>

                    <span className="client-item__copy-action">Copy Client ID</span>

                    <span className="client-item__copy-action">Copy Client Secret</span>
                </div>
            </div>
        )        
    }
}