import React, { PropTypes } from 'react';
import update from 'react-addons-update';
import ReactDOM from 'react-dom';
import find from 'lodash/find';
import map from 'lodash/map';
import api from 'app/lib/api';
import differenceBy from 'lodash/differenceBy';
import 'app/sass/platform/_purchases.scss';
import App from './app';
import TopBar from '../components/topbar';
import ListWithStats from '../components/purchases/list-with-stats';
import Outlets from '../components/purchases/outlets';
import TagFilter from '../components/topbar/tag-filter';
import Dropdown from '../components/global/dropdown';

/**
 * Admin Purchases page
 */
class Purchases extends React.Component {
    static propTypes = {
        user: PropTypes.object,
    }

    state = {
        outlets: [],
        users: [],
        searchOutlets: [],
        searchUsers: [],
        updatePurchases: false,
        activeTab: 'Summary',
        outletStatsTime: 'today so far',
    }

    findOutlets = (q) => {
        if (q.length === 0) {
            this.setState({ searchOutlets: [] });
        } else {
            const params = { outlets: { a: { title: q } } };

            api.get('search', $.param(params))
            .then(res => {
                if (res.outlets) {
                    this.setState({
                        searchOutlets: differenceBy(res.outlets.results, this.state.outlets, 'id'),
                    });
                }
            });
        }
    }

    findUsers = (q) => {
        if (q.length === 0) {
            this.setState({ searchUsers: [] });
        } else {
            const params = { users: { a: { full_name: q } } };

            $.ajax({
                url: '/api/search',
                type: 'GET',
                data: $.param(params),
                success: res => {
                    if (res.users) {
                        this.setState({
                            searchUsers: differenceBy(res.users.results, this.state.users, 'id'),
                        });
                    }
                },
            });
        }
    }

	/**
	 * Adds user to filter
	 * @param {string} userToAdd email of the user
	 */
    addUser = (userToAdd, index) => {
        const { searchUsers, users } = this.state;
        const user = searchUsers[index];

        if (user !== null) {
            if (find(users, ['id', user.id]) === undefined) {
                this.setState({
                    users: update(users, { $push: [user] }),
                    searchUsers: update(searchUsers, { $splice: [[index, 1]] }),
                    updatePurchases: true,
                });
            }
        }
    }


	/**
	 * Adds outlet to filter
	 * @param {string} outletToAdd String title of the outlet
	 */
    addOutlet = (outletToAdd, index) => {
        const { searchOutlets, outlets } = this.state;
        const outlet = searchOutlets[index];

        if (outlet !== null) {
            if (find(outlets, ['id', outlet.id]) === undefined) {
                this.setState({
                    outlets: update(outlets, { $push: [outlet] }),
                    searchOutlets: update(searchOutlets, { $splice: [[index, 1]] }),
                    updatePurchases: true,
                });
            }
        }
    }

	/**
	 * Remove user from filter
     * @param {string} userToRemove An email string of the user
     * @param {int} index index in the array
     */
    removeUser = (userToRemove, index) => {
        const user = this.state.users[index];

        this.setState({
            users: update(this.state.users, { $splice: [[index, 1]] }),
            searchUsers: update(this.state.searchUsers, { $push: [user] }),
            updatePurchases: true,
        });
    }

	/**
	 * Remove outlet from filter
	 * @param {string} outletToRemove A title string of the outlet
	 * @param {int} index index in the array
	 */
    removeOutlet = (outletToRemove, index) => {
        const { outlets, searchOutlets } = this.state;
        const outlet = outlets[index];

        this.setState({
            outlets: update(outlets, { $splice: [[index, 1]] }),
            searchOutlets: update(searchOutlets, { $push: [outlet] }),
            updatePurchases: true,
        });
    }

        /**
         * Loads stats for purchases
         */
    loadStats = (callback) => {
        const params = {
            outlet_ids: map(this.state.outlets, 'id'),
            user_ids: map(this.state.users, 'id'),
        };

        $.ajax({
            url: '/api/purchase/stats',
            type: 'GET',
            data: $.param(params),
        })
        .done(response => callback(response))
        .fail(() => $.snackbar({
            content: 'There was an error receiving purchases!',
        }));
    }

	/**
	 * Requests purchases from server
	 * @return {[type]} [description]
	 */
    loadPurchases = (last = null, cb) => {
        // Update state for purchase list if needed so it doesn't loop
        if (this.state.updatePurchases) {
            this.setState({ updatePurchases: false });
        }

        const params = {
            outlet_ids: map(this.state.outlets, 'id'),
            user_ids: map(this.state.users, 'id'),
            limit: 20,
            last,
        };

        $.ajax({
            url: '/api/purchase/list',
            type: 'GET',
            data: $.param(params),
        })
        .done(cb)
        .fail(() => $.snackbar({
            content: 'There was an error receiving purchases!',
        }));
    }

	/**
	 * Sends browser to script to generate CSV
	 */
    downloadExports = () => {
        const oultets = this.state.outlets
            .map((outlet) => `outlet_ids[]=${outlet.id}`)
            .join('&');

        const users = this.state.users
            .map(user => `user_ids[]=${user.id}`).join('&');

        const u = encodeURIComponent(`/purchase/report?${oultets}${users}`);

        const url = `/scripts/report?u=${u}&e=Failed`;

        window.open(url, '_blank');
    }

    renderTab() {
        const { activeTab, updatePurchases } = this.state;
        switch (activeTab.toLowerCase()) {
            case 'outlets':
                return (
                    <Outlets
                        outletIds={this.state.outlets.map(o => o.id)}
                        statsTime={this.state.outletStatsTime}
                    />
                );
            case 'summary':
            default:
                return (
                    <ListWithStats
                        updatePurchases={updatePurchases}
                        downloadExports={this.downloadExports}
                        loadPurchases={this.loadPurchases}
                        loadStats={this.loadStats}
                    />
                );
        }
    }

    render() {
        const {
            outlets,
            users,
            searchOutlets,
            searchUsers,
            activeTab,
            outletStatsTime,
        } = this.state;

        return (
            <App user={this.props.user}>
                <TopBar
                    title="Purchases"
                    tabs={['Summary', 'Outlets']}
                    setActiveTab={(t) => this.setState({ activeTab: t })}
                    activeTab={activeTab}
                >

                    <TagFilter
                        text="Outlets"
                        tagList={map(searchOutlets, 'title')}
                        filterList={map(outlets, 'title')}
                        onTagInput={this.findOutlets}
                        onTagAdd={this.addOutlet}
                        onTagRemove={this.removeOutlet}
                        key="outletsFilter"
                    />

                    {(activeTab === 'Summary') &&
                        <TagFilter
                            text="Users"
                            tagList={map(searchUsers, 'full_name')}
                            filterList={map(users, 'full_name')}
                            onTagInput={this.findUsers}
                            onTagAdd={this.addUser}
                            onTagRemove={this.removeUser}
                            key="usersFilter"
                        />
                    }

                    {(activeTab === 'Outlets') &&
                        <Dropdown
                            options={[
                                'today so far',
                                'last 24 hours',
                                'last 7 days',
                                'last 30 days',
                                'this year',
                                'all time',
                            ]}
                            selected={outletStatsTime}
                            onSelected={(b) => this.setState({ outletStatsTime: b })}
                            key="timeToggle"
                            inList
                        />
                    }
                </TopBar>

                {this.renderTab()}
            </App>
        );
    }
}

ReactDOM.render(
    <Purchases user={window.__initialProps__.user} />,
    document.getElementById('app')
);
