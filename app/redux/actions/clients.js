import api from 'app/lib/api';
import { enableLoading, toggleSnackbar, toggleModal } from './ui';
import { findById } from 'app/lib/helpers';

/**
 * Action types as consant
 */
export const RECEIVE_CLIENTS = 'RECEIVE_CLIENTS';
export const RECEIVE_CLIENT = 'RECEIVE_CLIENT';
export const REMOVE_CLIENT = 'REMOVE_CLIENT';
export const ADD_CLIENT = 'ADD_CLIENT';

/**
 * Action creators
 */
export const receiveClients = (clients) => ({
    type: RECEIVE_CLIENTS,
    clients
});

export const receiveClient = (client, index) => ({
    type: RECEIVE_CLIENT,
    client,
    index
});

export const removeClient = (index) => ({
    type: REMOVE_CLIENT,
    index
});

export const addClient = (client) => ({
    type: ADD_CLIENT,
    client
});


/**
 * Action creator for getting clients
 */
export const getClients = () => (dispatch) => {
    api
        .get('client/list')
        .then(response => dispatch(receiveClients([ response[0] ])))
}

/**
 * Action creator for generating a client
 */
export const generateClient = (params) => (dispatch) => {
    dispatch(enableLoading(true));

    api
        .post(`client/generate`, params)
        .then(response => {
            dispatch(addClient(response));
            dispatch(toggleModal(false));
            dispatch(enableLoading(false));
        })
        .catch(error => {
            dispatch(toggleSnackbar('There was an error creating this client!'))
            dispatch(enableLoading(false));
        });
}

/**
 * Updates a client
 * @param  {Object} params Params to update the client with
 */
export const updateClient = (id, params = {}) => (dispatch, getState) => {
    const { clients, ui } = getState();
    const { index, object } = findById(id, clients, 'id');

    dispatch(enableLoading(true));

    api
        .post(`client/${id}/update`, params)
        .then(response => {
            dispatch(receiveClient(response, index));
            dispatch(enableLoading(false));
            if(ui.showModal) dispatch(toggleModal(false));
        })
        .catch(error => {
            dispatch(enableLoading(false));
            //Send back client again to update state to previous
            dispatch(receiveClient(object, index))
            dispatch(toggleSnackbar('There was an error updating this client!'))
        });
}

/**
 * Adds secret to client object
 * @param  {String} client_id client's id
 */
export const updateClientWithSecret = (id, client_id) => (dispatch, getState) => {
    const { index, object } = findById(id, getState().clients, 'id');

    const mock = { ...object, 'client_secret': 'fasdasd'};

    api
        .get(`client/${client_id}/secret`)
        .then(response => dispatch(receiveClient(response, index)))
        .catch(error => {
            dispatch(receiveClient(mock, index));
            dispatch(toggleSnackbar('There was an error fetching this client\'s secret. Please contact api@fresconews.com.'))
        });
}


/**
 * Deletes a client
 * @param {String} id ID of the client
 * @param {Integer} index Index of the client within data source
 */
export const deleteClient = (id) => (dispatch, getState) => {
    const clients = getState().clients;
    let index = null;
    const clientToRemove = clients.find((c, i) => {
        index = i;
        return c['id'] === id;
    })

    dispatch(enableLoading(true));

    api
        .post(`client/${id}/delete`)
        .then(response => {
            dispatch(removeClient(id, index));
            dispatch(enableLoading(false));
        })
        .catch(error => {
            dispatch(enableLoading(false));
            dispatch(toggleSnackbar('There was an error deleting this client!'))
        });

}

export const rekeyClient = (clientID) => (dispatch) => {

}