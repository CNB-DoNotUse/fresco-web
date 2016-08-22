const UPDATE = 'user/UPDATE';
const initialState = {};

export default function reducer(state = initialState, action = {}) {
    switch (action.type) {
        case UPDATE:
            return state;
        default:
            return state;
    }
}
