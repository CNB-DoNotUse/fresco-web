import api from 'app/lib/api';

/**
 * Action types as consant
 */
export const TOGGLE_SNACKBAR = 'TOGGLE_SNACKBAR';
export const UPDATE_LOADING = 'UPDATE_LOADING';
export const TOGGLE_MODAL = 'UPDATE_MODAL';

//Action creators

/**
 * Shows or hides the snackbar in state
 * @param  {String}  snackbarText Text of the snackbar
 * @param  {Boolean} show Whether to show or hide, shown by default
 */
export const toggleSnackbar = (snackbarText, show = true) => ({
    type: TOGGLE_SNACKBAR,
    show,
    snackbarText
});

/**
 * Set's loading state
 * @param  {boolean} loading Is loading or not
 */
export const enableLoading = (loading) => ({
    type: UPDATE_LOADING,
    loading
});

export const toggleModal = (showModal = false) => ({
    type: TOGGLE_MODAL,
    showModal
});