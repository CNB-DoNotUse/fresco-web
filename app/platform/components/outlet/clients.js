import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import utils from 'utils';
import * as clients from 'app/redux/actions/clients';
import * as ui from 'app/redux/actions/ui';
import * as versions from 'app/redux/actions/versions';

import ClientForm from  '../dialogs/client-form.js';
import ClientItem from './client-item';

/**
 * OAauth client manager for 3rd parties
 */
class Clients extends React.Component {
    static propTypes = {
        clients: PropTypes.array,
        outlet: PropTypes.object,
        getClients: PropTypes.func,
        updateClient: PropTypes.func,
        isLoading: PropTypes.bool
    };

    state = {
        activeClient: null
    }

    componentDidMount() {
        this.props.getClients();
    }

    updateClient = (id, params) => {
        if(this.props.isLoading) return;
        this.props.updateClient(id, params);
    }

    /**
     * Toggles editing by setting client to be editing in state and later passing it to the token form
     * @param  {Object} activeClient Client to be edited
     */
    toggleEdit = (activeClient = null) => {
        this.setState({ activeClient })
        this.props.toggleModal();
    }

    render() {
        const {
            clients,
            outlet,
            generateClient,
            showModal,
            deleteClient,
            toggleModal,
            getVersions,
            versions,
            toggleSnackbar,
            getClient
        } = this.props;
        const { activeClient, tokenForm, clientIndex } = this.state;

        return (
            <div className="card client-tokens__card">
                <div className="header">
                    <span className="title">API Clients</span>

                    <div className="client-tokens__sub-header">
                        <span className="new-token" onClick={() => this.toggleEdit(null)}>NEW TOKEN</span>

                        <a href="https://fresconews.com/docs/api" className="api-docs">API DOCS</a>
                    </div>
                </div>

                <div className="client-tokens__body">
                    {clients.map((client, index) => {
                        return (
                            <ClientItem
                                updateClient={this.updateClient}
                                client={client}
                                toggle={toggleModal}
                                toggleEdit={this.toggleEdit}
                                toggleSnackbar={toggleSnackbar}
                                getClient={getClient}
                                key={index} />
                        )
                    })}
                </div>

                <ClientForm
                    newClient={activeClient ? false : true}
                    client={activeClient}
                    clientIndex={clientIndex}
                    toggled={showModal}
                    outlet={outlet}
                    versions={this.props.versions}
                    toggle={toggleModal}
                    getVersions={getVersions}
                    deleteClient={deleteClient}
                    updateClient={this.updateClient}
                    generateClient={generateClient} />
            </div>
        );
    };
};

Clients.defaultProps = {
    clients: []
}

const mapStateToProps = (state) => {
    return {
        clients: state.clients,
        versions: state.versions,
        showModal: state.ui.showModal
    }
}

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators(
        { ...clients, ...ui, ...versions },
        dispatch
    );
}

export default connect(mapStateToProps, mapDispatchToProps)(Clients);
