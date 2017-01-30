import React, { PropTypes } from 'react';
import utils from 'utils';

/**
 * OAauth client manager for 3rd parties
 */
export default class Clients extends React.Component {
    static propTypes = {
        outlet: PropTypes.object,
        clients: PropTypes.array,
        getClients: PropTypes.function,
        updateClient: PropTypes.function,
        isLoading: PropTypes.bool
    };

    componentDidMount() {
        this.props.getClients();   
    }

    updateClient = (id, params, index) => {
        if(this.props.isLoading) return;
        this.props.updateClient(id , params, index);   
    }

    toggleModal = () => {

    }

    render() {
        const { clients } = this.props;

        return (
            <div className="card client-tokens__card">
                <div className="header">
                    <span className="title">API Tokens</span>

                    <div className="client-tokens__sub-header">
                        <span className="new-token" onClick={this.toggleModal}>NEW TOKEN</span>

                        <a href="https://api.fresconews.com" className="api-docs">API DOCS</a>
                    </div>
                </div>

                <div className="client-tokens__body">
                    {clients.map((client, index) => {
                        return (
                            <ClientItem 
                                updateClient={this.updateClient}
                                client={client} 
                                key={index} />
                        )
                    })}
                </div>
            </div>
        );
    };
};

Clients.defaultProps = {
    clients: []
}


/**
 * Individual client item in the client list
 */
class ClientItem extends React.Component {

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
        this.setState({ editable: true });
    }

    /**
     * Toggles enabled state of the component, subsequently updates client
     * @param  {String} id ID of the client
     * @param {Integer} index Index within the list of clients
     */
    toggleEnabled = (id, index) => {
        const enabled = !this.state.enabled;
        this.setState({ enabled })
        this.props.updateClient(id, { enabled }, index)
    }


    render() {
        const { client, index } = this.props;
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
                        onChange={(e) => this.toggleEnabled(id, index)}
                        type="checkbox" 
                        checked={this.state.enabled ? 'true' : ''} 
                    />
                  </label>
                </div>

                <div className="client-item__info">
                    <h3 className="client-item__tag">{tag || 'No tag'}</h3>

                    {this.state.editable && 
                        <i className="mdi mdi-pencil client-item__edit"></i>
                    }
                    
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

