import api from 'app/lib/api';

/**
 * Action types as consant
 */
export const TOGGLE_SNACKBAR = 'TOGGLE_SNACKBAR';
export const UPDATE_LOADING = 'UPDATE_LOADING';

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