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
    galleries: fromJS({ entities: OrderedSet(), loading: false }),
    users: fromJS({ entities: OrderedSet(), loading: false }),
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
    afterEach(fetchMock.restore);

    it('returns the initial state', () => {
        expect(reducer(undefined, {})).to.equal(initialState);
    });

    it('creates FETCH_GALLERIES_SUCCESS when fetching galleries has been done', () => {
        fetchMock
        .mock('/api/gallery/reported?last=&limit=10', { body: [{ id: '1' }, { id: '2' }] });
        // TODO make initial reports fetch one single promise all with one emitted action
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
});

