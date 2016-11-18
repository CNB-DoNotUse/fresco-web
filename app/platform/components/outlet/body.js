import React, { PropTypes } from 'react';
import { createGetFromStorage, createSetInStorage } from 'app/lib/storage';
import reverse from 'lodash/reverse';
import Purchases from '../purchases/list-with-stats';
import PostList from '../post/list';
import Sidebar from './sidebar';

const getFromStorage = createGetFromStorage({ key: 'components/outlet/body' });
const setInStorage = createSetInStorage({ key: 'components/outlet/body' });

export default class Body extends React.Component {
    static propTypes = {
        outlet: PropTypes.object,
        user: PropTypes.object,
        activeTab: PropTypes.string,
    }

    state = {
        posts: [],
        purchases: [],
    }

    /**
     * Loads posts using purchases data enpoint
     */
    loadPosts = ({ last, direction = 'desc', cb }) => {
        let lastPurchaseOfPage;
        if (!last) lastPurchaseOfPage = getFromStorage('lastPurchaseOfPage');
        const callback = (purchases) => {
            if (!purchases || !purchases.length) {
                cb([]);
                return;
            }

            setInStorage({ lastPurchaseOfPage: purchases[purchases.length - 1].id });

            const posts = purchases.map(purchase =>
                Object.assign({}, purchase.post, { purchase_id: purchase.id }));
            cb(posts);
        };
        if (!last && lastPurchaseOfPage) {
            this.loadPurchases({ last: lastPurchaseOfPage, direction: 'asc', cb: callback });
        } else {
            this.loadPurchases({ last, direction, cb: callback });
        }
    }

    /**
     * Loads stats for purchases
     */
    loadStats = (callback) => {
        const params = {
            outlet_ids: [this.props.outlet.id],
        };

        $.ajax({
            url: '/api/purchase/stats',
            type: 'GET',
            data: $.param(params),
        })
        .done(callback)
        .fail(() => {
            $.snackbar({ content: 'There was an error receiving purchases!' });
        });
    }

    /**
     * Requests purchases from server
     */
    loadPurchases = ({ last = null, direction = 'desc', cb }) => {
        const params = {
            outlet_ids: [this.props.outlet.id],
            limit: 20,
            sortBy: 'created_at',
            last,
            direction,
        };

        $.ajax({
            url: '/api/purchase/list',
            type: 'GET',
            data: $.param(params),
        })
        .done((res) => {
            if (direction === 'asc') cb(reverse(res));
            else cb(res);
        })
        .fail(() => {
            $.snackbar({ content: 'There was an error receiving purchases!' });
            cb([]);
        });
    }

    downloadExports = () => {
        const oultet = `outlet_ids[]=${this.props.outlet.id}`;
        const u = encodeURIComponent(`/purchase/report?${oultet}`);
        const url = `/scripts/report?u=${u}&e=Failed`;

        window.open(url, '_blank');
    }

    render() {
        const { outlet, user, activeTab } = this.props;

        return (
            <div className="container-fluid tabs">
                <div className={`tab ${activeTab === 'Vault' ? 'toggled' : ''}`}>
                    <div className="container-fluid fat">
                        <div className="profile visible-xs" />

                        <Sidebar outlet={outlet} />

                        <div className="col-sm-8 tall">
                            <PostList
                                loadPosts={this.loadPosts}
                                size="large"
                                editable={false}
                                permissions={user.permissions}
                                paginateBy="purchase_id"
                                allPurchased
                                scrollable
                            />
                        </div>
                    </div>
                </div>
                <div className={`tab ${activeTab === 'Purchases' ? 'toggled' : ''}`}>
                    <Purchases
                        downloadExports={this.downloadExports}
                        loadPurchases={this.loadPurchases}
                        loadStats={this.loadStats}
                    />
                </div>
            </div>
        );
    }
}

