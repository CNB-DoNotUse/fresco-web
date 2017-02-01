import api from 'app/lib/api';

/**
 * Action types as consant
 */
export const RECEIVE_VERSIONS = 'RECEIVE_VERSIONS';

/**
 * Action creators
 */
export const receiveVersions = (versions) => ({
    type: RECEIVE_VERSIONS,
    versions
});

/**
 * Action creator for getting versions
 */
export const getVersions = () => (dispatch) => {
    api
        .get('version/list')
        .then(response => dispatch(receiveVersions(response)))
}