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
            dialog: null,
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
            dialog: null,
        }));
    });

    it('handles SEND_SUCCESS', () => {
        const initialState = reducer(undefined, {});
        const action = {
            type: pushActions.SEND_SUCCESS,
            template: 'default',
        };
        const nextState = reducer(initialState, action);

        expect(nextState).to.equal(fromJS({
            activeTab: 'default',
            templates: { default: {} },
            loading: false,
            error: null,
            dialog: 'Notification sent!',
        }));
    });

    it('handles SEND_FAIL', () => {
        const initialState = reducer(undefined, {});
        const action = {
            type: pushActions.SEND_FAIL,
            data: 'Fail',
        };
        const nextState = reducer(initialState, action);

        expect(nextState).to.equal(fromJS({
            activeTab: 'default',
            templates: {},
            loading: false,
            error: null,
            dialog: 'Fail',
        }));
    });

    it('handles SET_ACTIVE_TAB', () => {
        const initialState = reducer(undefined, {});
        const action = pushActions.setActiveTab('recommend');
        const nextState = reducer(initialState, action);

        expect(nextState).to.equal(fromJS({
            activeTab: 'recommend',
            templates: {},
            loading: false,
            error: null,
            dialog: null,
        }));
    });

    it('handles CONFIRM_DIALOG', () => {
        const initialState = reducer(undefined, {
            type: pushActions.SEND_FAIL,
            data: 'Fail!',
        });
        const action = pushActions.confirmDialog();
        const nextState = reducer(initialState, action);

        expect(nextState).to.equal(fromJS({
            activeTab: 'default',
            templates: {},
            loading: false,
            error: null,
            dialog: null,
        }));
    });


    it('handles UPDATE_TEMPLATE_SUCCESS', () => {
        const initialState = reducer(undefined, {});
        const action = {
            type: pushActions.UPDATE_TEMPLATE_SUCCESS,
            template: 'default',
            data: { title: 'I\'m a title!' },
        };
        const nextState = reducer(initialState, action);

        expect(nextState).to.equal(fromJS({
            activeTab: 'default',
            templates: { default: { title: 'I\'m a title!' } },
            loading: false,
            error: null,
            dialog: null,
        }));
    });

    it('handles UPDATE_TEMPLATE_ERROR', () => {
        const initialState = reducer(undefined, {});
        const action = {
            type: pushActions.UPDATE_TEMPLATE_ERROR,
            data: 'Error updating template',
        };
        const nextState = reducer(initialState, action);

        expect(nextState).to.equal(fromJS({
            activeTab: 'default',
            templates: {},
            loading: false,
            error: null,
            dialog: 'Error updating template',
        }));
    });
});

