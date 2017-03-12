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
    
    //Assemble params from state
    params.client_id = getState().client_id;
    params.redirect_uri = getState().redirect_uri;
    params.scope = getState().scope;

    request
        .post('scripts/oauth/authorize', Object.assign(params, { authorization_type }))
        .then(response => {
            if(response.success && response.redirect_uri !== null) {
                //Send the user to the redirect URI
                window.location = response.redirect_uri;            
            } else{
                return Promise.reject();
            }
        })
        .catch(error => {
            dispatch(toggleSnackbar('There was an error authorizing you! Please check with the application that is requesting access to your account.'))
        })
        .then(() => {
            dispatch(enableLoading(false));
        });
}

/**
 * Cancels the OAuth process by sending 
 * the user back to where they came from
 */
export const cancel = () => (dispatch, getState) => {
    window.location = `${getState().redirect_uri}?status=denied`;
}

/**
 * TODO
 */
export const revoke = () => (dispatch) => {}

