import api from 'app/lib/api';
import utils from 'utils';
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
export const getClients = () => (dispatch, getState) => {
    const outlet_id = getState().user.outlet.id;

    api
        .get('client/list', { outlet_id })
        .then(response => dispatch(receiveClients(response)))
}

/**
 * Action creator for generating a client
 */
export const generateClient = (params = {}) => (dispatch) => {
    dispatch(enableLoading(true));

    //Validate
    if(!params.api_version_id) {
        return dispatch(toggleSnackbar('Please select a version for your client!'))
    }

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
 * Gets a client by it's ID.
 * @param  {String} id client's id, not the client's client_id
 */
export const getClient = (id, show_secret) => (dispatch, getState) => {
    const { index, object } = findById(id, getState().clients, 'id');

    api
        .get(`client/${id}`, { show_secret })
        .then(response => dispatch(receiveClient(response, index)))
        .catch(error => {
            if(show_secret) {
                dispatch(toggleSnackbar('There was an error fetching this client\'s secret. Please contact api@fresconews.com.'))
            } else {
                dispatch(toggleSnackbar('There was an error fetching this client!. Please contact api@fresconews.com.'))
            }
        });
}


/**
 * Deletes a client
 * @param {String} id ID of the client
 * @param {Integer} index Index of the client within data source
 */
export const deleteClient = (id) => (dispatch, getState) => {
    const { index, object } = findById(id, getState().clients, 'id');
    dispatch(enableLoading(true));

    api
        .post(`client/${id}/delete`)
        .then(response => {
            dispatch(enableLoading(false));
            dispatch(toggleModal(false));
            dispatch(removeClient(index));
        })
        .catch(error => {
            dispatch(enableLoading(false));
            dispatch(toggleSnackbar('There was an error deleting this client!'))
        });

}
