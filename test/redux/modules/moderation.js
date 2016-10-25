import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import fetchMock from 'fetch-mock';
import { fromJS, Set, OrderedSet } from 'immutable';
import { expect } from 'chai';
import reducer, * as actions from 'app/redux/modules/moderation';
import 'isomorphic-fetch';

const middleware = [thunk];
const mockStore = configureMockStore(middleware);

const initialState = fromJS({
    galleries: fromJS({ entities: OrderedSet(), loading: false, requestDeleted: {} }),
    users: fromJS({ entities: OrderedSet(), loading: false, requestDeleted: {} }),
    suspendedUsers: fromJS({ entities: OrderedSet(), loading: false }),
    reports: fromJS({ galleries: {}, users: {}, loading: false }),
    ui: fromJS({
        activeTab: 'galleries',
        filters: fromJS({ galleries: Set(), users: Set() }),
        suspendedDialog: false,
        infoDialog: fromJS({ open: false, header: '', body: '' }),
        error: null,
        alert: null,
    }),
});

describe('moderation reducer', () => {
    it('returns the initial state', () => {
        expect(reducer(undefined, {})).to.equal(initialState);
    });

    it('should handle TOGGLE_SUSPENDED_DIALOG', () => {
        expect(reducer(undefined, actions.toggleSuspendedDialog()).toJS())
        .to.have.deep.property('ui.suspendedDialog', true);
    });

    it('should handle TOGGLE_INFO_DIALOG', () => {
        const state = reducer(undefined, actions.toggleInfoDialog({
            open: true, header: 'Fresco header', body: 'Fresco body',
        })).toJS();

        expect(state).to.have.deep.property('ui.infoDialog.open', true);
        expect(state).to.have.deep.property('ui.infoDialog.header', 'Fresco header');
        expect(state).to.have.deep.property('ui.infoDialog.body', 'Fresco body');
    });

    // it('should handle ENABLE_FILTER and DISABLE_FILTER', () => {
    //     const action = {
    //         type: actions.ENABLE_FILTER,
    //         tab: 'galleries',
    //         filter: 'abuse',
    //     };
    //     const state = reducer(undefined, action).toJS();
    //     console.log('state', state);
    //     expect(state).to.have.deep.property('ui.filters.galleries', ['abuse']);
    // });
});

describe('moderation async action creators', () => {
    afterEach(fetchMock.restore);

    it('creates FETCH_GALLERIES_SUCCESS when fetching galleries has been done', () => {
        fetchMock
        .mock('/api/gallery/reported?last=&limit=10', { body: [{ id: '1' }, { id: '2' }] });
        fetchMock
        .mock(/\/api\/gallery\/\d+\/reports+/, { body: [{ id: '1' }, { id: '2' }] });

        // const expectedActions = [
        //     {
        //         entityType: 'galleries',
        //         id: '1',
        //         reports: [{ id: '1' }, { id: '2' }],
        //         type: actions.FETCH_REPORTS_SUCCESS,
        //     },
        //     {
        //         entityType: 'galleries',
        //         id: '2',
        //         reports: [{ id: '1' }, { id: '2' }],
        //         type: actions.FETCH_REPORTS_SUCCESS,
        //     },
        // ];
        const store = mockStore(fromJS({ moderation: initialState }));

        return store.dispatch(actions.fetchGalleries())
        .then(() => {
            expect(store.getActions()).to.include({ type: actions.FETCH_GALLERIES_REQUEST });
            expect(store.getActions()).to.include({
                type: actions.FETCH_GALLERIES_SUCCESS,
                data: [{ id: '1' }, { id: '2' }],
            });
        });
    });

    it('creates FETCH_USERS_SUCCESS when fetching users has been done', () => {
        fetchMock
        .mock('/api/user/reported?last=&limit=10', { body: [{ id: '1' }, { id: '2' }] });
        fetchMock
        .mock(/\/api\/user\/\d+\/reports+/, { body: [{ id: '1' }, { id: '2' }] });

        const store = mockStore(fromJS({ moderation: initialState }));

        return store.dispatch(actions.fetchUsers())
        .then(() => {
            expect(store.getActions()).to.include({ type: actions.FETCH_USERS_REQUEST });
            expect(store.getActions()).to.include({
                type: actions.FETCH_USERS_SUCCESS,
                data: [{ id: '1' }, { id: '2' }],
            });
        });
    });

    it('creates FETCH_SUSPENDED_USERS_SUCCESS when fetching suspended users has been done', () => {
        fetchMock
        .mock('/api/user/suspended?', { body: [{ id: '1' }, { id: '2' }] });

        const store = mockStore(fromJS({ moderation: initialState }));

        return store.dispatch(actions.fetchSuspendedUsers())
        .then(() => {
            expect(store.getActions()).to.include({ type: actions.FETCH_SUSPENDED_USERS_REQUEST });
            expect(store.getActions()).to.include({
                type: actions.FETCH_SUSPENDED_USERS_SUCCESS,
                data: [{ id: '1' }, { id: '2' }],
            });
        });
    });

    it('creates FETCH_REPORTS_SUCCESS  when fetching reports has been done', () => {
        fetchMock
        .mock('/api/user/1/reports?last=&limit=10', { body: { text: 'report text' } });

        const store = mockStore(fromJS({ moderation: initialState }));

        return store.dispatch(actions.fetchReports({ id: '1', entityType: 'user' }))
        .then(() => {
            expect(store.getActions()).to.include({
                type: actions.FETCH_REPORTS_SUCCESS,
                reports: { text: 'report text' },
                entityType: 'user',
                id: '1',
            });
        });
    });
});

