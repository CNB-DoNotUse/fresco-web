import api from 'app/lib/api';
import { isLoading, toggleSnackbar, toggleModal } from './ui';

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

export const receiveClient = (client, id, index) => ({
    type: RECEIVE_CLIENT,
    client,
    id,
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
        .then(response => dispatch(receiveClients(response)))
}

// /**
//  * Gets API version
//  * @param  {[type]} ) [description]
//  * @return {[type]}   [description]
//  */
// export const getVersions = () => (dispatch) => {
//     api
//         .get('versions/list')
//         .then(response => dispatch(receiveVersions(response)))
// }



/**
 * Action creator for generating a client
 */
export const generateClient = (params) => (dispatch) => {
    dispatch(isLoading(true));

    api
        .post(`client/generate`, params)
        .then(response => {
            dispatch(addClient(response));
            dispatch(toggleModal(false));
            dispatch(isLoading(false));
        })
        .catch(error => {
            dispatch(toggleSnackbar('There was an error creating this client!'))
            dispatch(isLoading(false));
        });
}

/**
 * Updates a client
 * @param  {Object} params Params to update the client with
 */
export const updateClient = (id, params = {}) => (dispatch, getState) => {
    const clients = getState().clients;
    let index = null;
    const clientToUpdate = clients.find((c, i) => {
        index = i;
        return c['id'] === id;
    })

    dispatch(isLoading(true));

    api
        .post(`client/${id}/update`, params)
        .then(response => {
            dispatch(receiveClient(response, id, index));
            dispatch(toggleModal(false));
            dispatch(isLoading(false));
        })
        .catch(error => {
            dispatch(isLoading(false));
            //Send back clients again to update state
            dispatch(receiveClients(clients))
            dispatch(toggleSnackbar('There was an error updating this client!'))
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

    dispatch(isLoading(true));

    api
        .post(`client/${id}/delete`)
        .then(response => {
            dispatch(removeClient(id, index));
            dispatch(isLoading(false));
        })
        .catch(error => {
            dispatch(isLoading(false));
            dispatch(toggleSnackbar('There was an error deleting this client!'))
        });

}

export const rekeyClient = (clientID) => (dispatch) => {

}