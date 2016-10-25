import { fromJS, Map } from 'immutable';
import { expect } from 'chai';
import reducer, * as pushActions from '../../../app/redux/modules/pushNotifs';

const initialState = fromJS({
    activeTab: 'default',
    templates: {},
    loading: false,
    error: null,
    alert: null,
    requestConfirmSend: false,
    infoDialog: {},
});

describe('push notifs reducer', () => {
    it('returns the initial state', () => {
        expect(reducer(undefined, {})).to.equal(initialState);
    });

    it('handles SEND', () => {
        const action = { type: pushActions.SEND };
        const nextState = reducer(initialState, action);
        expect(nextState).to.equal(initialState.set('requestConfirmSend', true));
    });

    it('handles SEND_SUCCESS', () => {
        const action = {
            type: pushActions.SEND_SUCCESS,
            template: 'default',
            header: 'Success',
            body: 'Success',
        };
        const nextState = reducer(initialState, action);

        expect(nextState).to.equal(initialState
            .set('alert', 'Notification sent!')
            .setIn(['templates', action.template], Map())
            .set('infoDialog', fromJS({
                visible: true,
                header: action.header,
                body: action.body,
            }))
        );
    });

    it('handles SEND_FAIL', () => {
        const action = {
            type: pushActions.SEND_FAIL,
            data: 'Fail',
        };
        const nextState = reducer(initialState, action);

        expect(nextState).to.equal(initialState
            .set('loading', false)
            .set('requestConfirmSend', false)
            .set('alert', action.data)
        );
    });

    it('handles SET_ACTIVE_TAB', () => {
        const action = pushActions.setActiveTab('recommend');
        const nextState = reducer(initialState, action);

        expect(nextState).to.equal(initialState
            .set('activeTab', action.activeTab.toLowerCase())
        );
    });

    it('handles DISMISS_ALERT', () => {
        const state = reducer(undefined, {
            type: pushActions.SEND_FAIL,
            data: 'Fail!',
        });
        expect(state).to.equal(state
            .set('alert', 'Fail!')
        );

        const action = pushActions.dismissAlert();
        const nextState = reducer(initialState, action);

        expect(nextState).to.equal(state
            .set('alert', null)
        );
    });

    it('handles UPDATE_TEMPLATE_SUCCESS', () => {
        const action = {
            type: pushActions.UPDATE_TEMPLATE_SUCCESS,
            template: 'default',
            data: { title: 'I\'m a title!' },
        };
        const nextState = reducer(undefined, action);

        expect(nextState).to.equal(initialState
            .mergeIn(['templates', action.template], action.data)
        );
    });

    it('handles UPDATE_TEMPLATE_ERROR', () => {
        const action = {
            type: pushActions.UPDATE_TEMPLATE_ERROR,
            msg: 'Error updating template',
        };
        const nextState = reducer(undefined, action);

        expect(nextState).to.equal(initialState
            .set('alert', action.msg)
        );
    });
});

