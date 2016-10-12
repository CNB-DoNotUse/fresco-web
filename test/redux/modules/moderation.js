import { fromJS, List, Set } from 'immutable';
import { expect } from 'chai';
import reducer, * as moderationActions from 'app/redux/modules/moderation';

describe('moderation reducer', () => {
    it('returns the initial state', () => {
        expect(reducer(undefined, {})).to.equal(fromJS({
            activeTab: 'galleries',
            galleries: List(),
            users: List(),
            suspendedUsers: List(),
            reports: fromJS({ galleries: {}, users: {} }),
            filters: fromJS({ galleries: Set(), users: Set() }),
            loading: false,
            suspendedDialog: false,
            infoDialog: fromJS({ open: false, header: '', body: '' }),
            error: null,
            alert: null,
        }));
    });

    // it('handles FETCH_GALLERIES', () => {

    // })
});
