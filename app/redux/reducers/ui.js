import * as actions from '../actions/ui';

/**
 * UI reducer
 */
 const ui = (state = {}, action) => {
    switch (action.type) {
        case actions.UPDATE_LOADING:
            return {...state, loading: action.loading }
        case actions.TOGGLE_MODAL:
            return {
                ...state, 
                showModal: action.showModal || (typeof(state.showModal) === 'undefined' ? true : !state.showModal) 
            }
        case actions.TOGGLE_SNACKBAR:
            return {...state, snackbarText: action.snackbarText, showSnackbar: action.show }
        default:
            return state
    }
}


export default ui;
