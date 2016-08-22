const SAVE = 'pushNotifications/SAVE';
const SAVE_SUCCESS = 'pushNotifications/SAVE_SUCCESS';
const SAVE_FAIL = 'pushNotifications/SAVE_FAIL';

const initialState = {
    loading: false,
};

export default function reducer(state = initialState, action = {}) {
    switch (action.type) {
        case SAVE:
        case SAVE_SUCCESS:
        case SAVE_FAIL:
            return state;
        default:
            return state;
    }
}
