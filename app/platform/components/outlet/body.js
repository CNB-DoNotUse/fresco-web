import React, { PropTypes } from 'react';
import Purchases from '../purchases/list-with-stats';
import PostList from '../post/list';
import Sidebar from './sidebar';

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
    loadPosts = (last, cb) => {
        this.loadPurchases(last, (purchases) => {
            const posts = purchases.map((purchase) => purchase.post);
            cb(posts);
        });
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
    loadPurchases = (last = null, cb) => {
        const params = {
            outlet_ids: [this.props.outlet.id],
            limit: 20,
            last,
        };

        $.ajax({
            url: '/api/purchase/list',
            type: 'GET',
            data: $.param(params),
        })
        .done(cb)
        .fail(() => {
            $.snackbar({ content: 'There was an error receiving purchases!' });
        });
    }

    downloadExports = () => {
        const oultet = `outlet_ids[]=${this.props.outlet.id}`;
        const u = encodeURIComponent(`/purchase/report?${oultet}`);
        const url = `/scripts/report?u=${u}&e=Failed`;

        window.open(url, '_blank');
    }

    emailStatement = () => {
        $.ajax({
            url: '/api/outlet/emailStatement',
            type: 'GET',
            dataType: 'json',
            success: () => {
                $.snackbar({
                    content: 'Account statement successfully sent! Please check your email.',
                });
            },
            error: () => {
                $.snackbar({ content: 'Could not email statement' });
            },
        });
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
                                allPurchased
                                scrollable
                            />
                        </div>
                    </div>
                </div>
                <div className={`tab ${activeTab === 'Purchases' ? 'toggled' : ''}`}>
                    <Purchases
                        emailStatement={this.emailStatement}
                        downloadExports={this.downloadExports}
                        loadPurchases={this.loadPurchases}
                        loadStats={this.loadStats}
                    />
                </div>
            </div>
        );
    }
}
