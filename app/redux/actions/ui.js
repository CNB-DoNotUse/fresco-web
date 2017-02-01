import api from 'app/lib/api';

/**
 * Action types as consant
 */
export const TOGGLE_SNACKBAR = 'TOGGLE_SNACKBAR';
export const UPDATE_LOADING = 'UPDATE_LOADING';
export const TOGGLE_MODAL = 'UPDATE_MODAL';

/**
 * Action creators
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
export const isLoading = (loading) => ({
    type: UPDATE_LOADING,
    loading
});

export const toggleModal = (showModal) => ({
    type: TOGGLE_MODAL,
    showModal
});