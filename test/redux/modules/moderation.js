import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import fetchMock from 'fetch-mock';
import { fromJS, Set, OrderedSet, Map } from 'immutable';
import { expect } from 'chai';
import reducer, * as actions from 'app/redux/modules/moderation';
import 'isomorphic-fetch';

const middleware = [thunk];
const mockStore = configureMockStore(middleware);

describe('moderation ui reducer', () => {
    const initialState = fromJS({
        activeTab: 'galleries',
        filters: fromJS({ galleries: Set(), users: Set() }),
        suspendedDialog: false,
        infoDialog: fromJS({ open: false, header: '', body: '' }),
        error: null,
        alert: null,
    });

    it('returns the initial state', () => {
        expect(reducer(undefined, {}).get('ui')).to.equal(initialState);
    });

    it('handles TOGGLE_SUSPENDED_DIALOG', () => {
        expect(reducer(undefined, actions.toggleSuspendedDialog()))
        .to.have.deep.property('ui.suspendedDialog', true);
    });

    it('handles TOGGLE_INFO_DIALOG', () => {
        const state = reducer(undefined, actions.toggleInfoDialog({
            open: true, header: 'Fresco header', body: 'Fresco body',
        }));

        expect(state).to.have.deep.property('ui.infoDialog.open', true);
        expect(state).to.have.deep.property('ui.infoDialog.header', 'Fresco header');
        expect(state).to.have.deep.property('ui.infoDialog.body', 'Fresco body');
    });

    it('handles TOGGLE_FILTER', () => {
        const state = reducer(undefined, actions.toggleFilter('galleries', 'abuse'));

        expect(state).to.have.deep.property('ui.filters.galleries', Set.of('abuse'));
    });

    it('handles SET_ACTIVE_TAB', () => {
        const state = reducer(undefined, actions.setActiveTab('users'));
        expect(state).to.have.deep.property('ui.activeTab', 'users');
    });

    it('handles SET_ALERT', () => {
        const state = reducer(undefined, { type: actions.SET_ALERT, data: 'Alert!' });
        expect(state).to.have.deep.property('ui.alert', 'Alert!');
    });

    it('handles DISMISS_ALERT', () => {
        let state = reducer(undefined, { type: actions.SET_ALERT, data: 'Alert!' });
        expect(state).to.have.deep.property('ui.alert', 'Alert!');

        state = reducer(state, { type: actions.DISMISS_ALERT });
        expect(state).to.have.deep.property('ui.alert', null);
    });
});

describe('moderation reports reducer', () => {
    it('handles FETCH_REPORTS_SUCCESS', () => {
        const state = reducer(undefined, {
            type: actions.FETCH_REPORTS_SUCCESS,
            reports: [{ id: '1' }, { id: '2' }],
            entityType: 'users',
            id: '1',
        });

        expect(state).to.have.deep.property('reports.users.1').that.equals(
            fromJS({ reports: [{ id: '1' }, { id: '2' }], index: 0 })
        );
    });

    it('handles SET_REPORTS_INDEX', () => {
        const state = reducer(undefined, {
            type: actions.SET_REPORTS_INDEX,
            entityType: 'users',
            ownerId: '1',
            index: 3,
        });

        expect(state).to.have.deep.property('reports.users.1.index').that.equals(3);
    });
});

describe('moderation suspendedUsers reducer', () => {
    it('handles FETCH_SUSPENDED_USERS_SUCCESS', () => {
        const state = reducer(undefined, {
            type: actions.FETCH_SUSPENDED_USERS_SUCCESS,
            data: [{ id: '1' }, { id: '2' }],
        });

        expect(state).to.have.deep.property(
            'suspendedUsers.entities',
            OrderedSet(fromJS([{ id: '1' }, { id: '2' }]))
        );
    });

    it('handles RESTORE_SUSPENDED_USER', () => {
        const state = reducer(undefined, {
            type: actions.FETCH_SUSPENDED_USERS_SUCCESS,
            data: [{ id: '1' }, { id: '2' }],
        });

        expect(state).to.have.deep.property(
            'suspendedUsers.entities',
            OrderedSet(fromJS([{ id: '1' }, { id: '2' }]))
        );
    });
});

describe('moderation users reducer', () => {
    it('handles FETCH_USERS_SUCCESS', () => {
        const state = reducer(undefined, {
            type: actions.FETCH_USERS_SUCCESS,
            data: [{ id: '1' }, { id: '2' }],
        });

        expect(state).to.have.deep.property(
            'users.entities',
            OrderedSet(fromJS([{ id: '1' }, { id: '2' }]))
        );
    });

    it('handles REQUEST_DELETE_CARD', () => {
        const state = reducer(undefined, {
            type: actions.REQUEST_DELETE_CARD,
            id: '3',
            entityType: 'user',
        });

        expect(state).to.have.deep.property(
            'users.requestDeleted',
            fromJS({ id: '3', entityType: 'user' })
        );
    });

    it('handles CONFIRM_DELETE_CARD', () => {
        let state = reducer(undefined, {
            type: actions.FETCH_USERS_SUCCESS,
            data: [{ id: '1' }, { id: '2' }, { id: '3' }],
        });

        expect(state).to.have.deep.property('users.entities',
            OrderedSet(fromJS([{ id: '1' }, { id: '2' }, { id: '3' }]))
        );

        state = reducer(state, {
            type: actions.REQUEST_DELETE_CARD,
            id: '3',
            entityType: 'user',
        });

        state = reducer(state, {
            type: actions.CONFIRM_DELETE_CARD,
            id: '3',
        });

        expect(state).to.have.deep.property('users.requestDeleted', Map());
        expect(state).to.have.deep.property('users.entities',
            OrderedSet(fromJS([{ id: '1' }, { id: '2' }]))
        );
    });
});

describe('moderation galleries reducer', () => {
    it('handles FETCH_GALLERIES_SUCCESS', () => {
        const state = reducer(undefined, {
            type: actions.FETCH_GALLERIES_SUCCESS,
            data: [{ id: '1' }, { id: '2' }],
        });

        expect(state).to.have.deep.property(
            'galleries.entities',
            OrderedSet(fromJS([{ id: '1' }, { id: '2' }]))
        );
    });

    it('handles REQUEST_DELETE_CARD', () => {
        const state = reducer(undefined, {
            type: actions.REQUEST_DELETE_CARD,
            id: '3',
            entityType: 'gallery',
        });

        expect(state).to.have.deep.property(
            'galleries.requestDeleted',
            fromJS({ id: '3', entityType: 'gallery' })
        );
    });

    it('handles CONFIRM_DELETE_CARD', () => {
        let state = reducer(undefined, {
            type: actions.FETCH_GALLERIES_SUCCESS,
            data: [{ id: '1' }, { id: '2' }, { id: '3' }],
        });

        expect(state).to.have.deep.property('galleries.entities',
            OrderedSet(fromJS([{ id: '1' }, { id: '2' }, { id: '3' }]))
        );

        state = reducer(state, {
            type: actions.REQUEST_DELETE_CARD,
            id: '3',
            entityType: 'gallery',
        });

        state = reducer(state, {
            type: actions.CONFIRM_DELETE_CARD,
            id: '3',
        });

        expect(state).to.have.deep.property('galleries.requestDeleted', Map());
        expect(state).to.have.deep.property('galleries.entities',
            OrderedSet(fromJS([{ id: '1' }, { id: '2' }]))
        );
    });
});

describe('moderation async action creators', () => {
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

    afterEach(fetchMock.restore);

    it('creates FETCH_GALLERIES_SUCCESS when fetching galleries has been done', () => {
        fetchMock
        .mock('/api/gallery/reported?last=&limit=10', { body: [{ id: '1' }, { id: '2' }] });
        fetchMock
        .mock(/\/api\/gallery\/\d+\/reports+/, { body: [{ id: '1' }, { id: '2' }] });

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

