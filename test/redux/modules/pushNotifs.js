import { fromJS } from 'immutable';
import { expect } from 'chai';
import reducer, * as pushActions from '../../../app/redux/modules/pushNotifs';

describe('push notifs reducer', () => {
    it('returns the initial state', () => {
        expect(reducer(undefined, {})).to.equal(fromJS({
            activeTab: 'default',
            templates: {},
            loading: false,
            error: null,
        }));
    });

    it('handles SEND', () => {
        const initialState = reducer(undefined, {});
        const action = { type: pushActions.SEND };
        const nextState = reducer(initialState, action);

        expect(nextState).to.equal(fromJS({
            activeTab: 'default',
            templates: {},
            loading: true,
            error: null,
        }));
    });

    // it('handles PREV_PAGE', () => {
    //     const initialState = reducer(fromJS({ page: 1, rows: 10 }), {});
    //     const action = appActions.prevPage();
    //     const nextState = reducer(initialState, action);
    //     expect(nextState).to.equal(fromJS({ page: 0, rows: 10 }));
    // });

    // it('handles PREV_PAGE from page 0', () => {
    //     const initialState = reducer(undefined, {});
    //     const action = appActions.prevPage();
    //     const nextState = reducer(initialState, action);
    //     expect(nextState).to.equal(fromJS({ page: 0, rows: 10, mobile: false }));
    // });

    // it('handles SET_ROWS', () => {
    //     const initialState = reducer(undefined, {});
    //     const action = appActions.setRows(20);
    //     const nextState = reducer(initialState, action);
    //     expect(nextState).to.equal(fromJS({ page: 0, rows: 20, mobile: false }));
    // });

    // it('handles SET_MOBILE', () => {
    //     const initialState = reducer(undefined, {});
    //     const action = appActions.setMobile(true);
    //     const nextState = reducer(initialState, action);
    //     expect(nextState).to.equal(fromJS({ page: 0, rows: 10, mobile: true }));
    // });
});

