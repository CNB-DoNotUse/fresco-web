const UPDATE = 'user/UPDATE';
import { fromJS } from 'immutable';

const user = (state = fromJS({}), action = {}) => {
    switch (action.type) {
        case UPDATE:
            return state;
        default:
            return state;
    }
};

export default user;

