import request from 'app/lib/request';
import { enableLoading, toggleSnackbar } from './ui';

/**
 * Action types as consant
 */
export const AUTHORIZE = 'AUTHORIZE';


/**
 * Action creator for authorizing via the OAuth form. Authorization can happen
 * either by a regular log in, or by just confirming the user hit "Accept" because
 * they're already logged in.
 * @param {Object} params Params sent to authorize
 * @param {String} authorization_type Type of authentication e.g. login, simple approval
 */
export const authorize = (params = {}, authorization_type = 'approval') => (dispatch, getState) => {
    dispatch(enableLoading(true));

    params.client_id = getState().client_id;
    params.redirect_uri = getState().redirect_uri;
    params.scope = getState().scope;

    request
        .post('scripts/oauth/authorize', Object.assign(params, { authorization_type }))
        .then(response => {
            dispatch(receiveOutlet(response));

            
        })
        .catch(error => {
            console.log(error);
            dispatch(toggleSnackbar('There was an error authorizing you!'))
        })
        .then(() => {
            dispatch(enableLoading(false));
        }) 
}


