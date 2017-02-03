import React, { PropTypes } from 'react';
import utils from 'utils';
require('script!clipboard/dist/clipboard.js');

/**
 * Individual client item in the client list
 */
export default class ClientItem extends React.Component {
    static propTypes = {
        enabled: PropTypes.bool,
        updateClient: PropTypes.func,
        toggleEdit: PropTypes.func,
        updateClientWithSecret: PropTypes.func.isRequired,
        client: PropTypes.object.isRequired
    }

    state = {
        editable: false,
        enabled: this.props.client.enabled,
        client_id_clipboard: null,
        client_secret_clipboard: null
    }

    componentDidMount() {
        this.configureClipboard();
    }

    componentWillReceiveProps(nextProps) {
        const { client } = nextProps;
        if(client.enabled !== this.state.enabled) {
            this.setState({ enabled: client.enabled })
        }
    }

    componentDidUpdate(prevProps, prevState) {
        const { client } = this.props;

        if((client.client_secret && !prevProps.client.client_secret) || client.id !== prevProps.client.id) {
            this.configureClipboard();
        }
    }

    /**
     * Configures clipboard actions
     */
    configureClipboard = () => {
        const { client } = this.props;
        const client_id_clipboard = new Clipboard(this.refs.client_id, {
            text: (trigger) => {
                return client.client_id;
            }
        }); 

        client_id_clipboard.on('success', (e) => {
            this.props.toggleSnackbar('Client ID successfully copied!')
        });
        
        if(this.state.client_id_clipboard)
            this.state.client_id_clipboard.destroy();
        
        this.setState({ client_id_clipboard })

        if(client.client_secret) {
            const client_secret_clipboard = new Clipboard(this.refs.client_secret, {
                text: (trigger) => {
                    return client.client_secret;
                }
            });  
         
            client_secret_clipboard.on('success', (e) => {
                this.props.toggleSnackbar('Client Secret successfully copied!')
            })

            if(this.state.client_secret_clipboard)
                this.state.client_secret_clipboard.destroy();

            this.setState({ client_secret_clipboard })
        }
    }

    clientSecretClicked = () => {
        if(!this.props.client.client_secret) {
            this.props.updateClientWithSecret(this.props.client.id, this.props.client.client_id);
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
        const { tag, api_version, last_used_at, id, client_id } = client;
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
                        <span>{last_used_at ? 'Last active ' + utils.formatTime(last_used_at, true) : 'No record of activity'}</span>
                    </p>

                    <span 
                        className="client-item__copy-action" 
                        ref="client_id">Copy Client ID</span>

                    <span 
                        className="client-item__copy-action"
                        onClick={this.clientSecretClicked}
                        ref="client_secret">{!client.client_secret ? 'Request secret' : 'Copy Client Secret'}</span>
                </div>
            </div>
        )        
    }
}