import React, { PropTypes } from 'react';
import update from 'react-addons-update';
import ReactDOM from 'react-dom';
import find from 'lodash/find';
import map from 'lodash/map';
import App from './app';
import TopBar from '../components/topbar';
import Summary from '../components/purchases';
import TagFilter from '../components/topbar/tag-filter';

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
        availableOutlets: [],
        availableUsers: [],
        updatePurchases: false,
        activeTab: 'Summary',
    }

    findOutlets = (q) => {
        if (q.length === 0) {
            this.setState({ availableOutlets: [] });
        } else {
            const params = { outlets: { a: { title: q } } };

            $.ajax({
                url: '/api/search',
                type: 'GET',
                data: $.param(params),
                success: response => {
                    if (response.outlets) {
                        this.setState({
                            availableOutlets: response.outlets.results,
                        });
                    }
                },
            });
        }
    }

    findUsers = (q) => {
        if (q.length === 0) {
            this.setState({ availableUsers: [] });
        } else {
            const params = { users: { a: { full_name: q } } };

            $.ajax({
                url: '/api/search',
                type: 'GET',
                data: $.param(params),
                success: response => {
                    if (response.users) {
                        this.setState({
                            availableUsers: response.users.results,
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
        const { availableUsers, users } = this.state;
        const user = availableUsers[index];

        if (user !== null) {
            if (find(users, ['id', user.id]) === undefined) {
                this.setState({
                    users: update(users, { $push: [user] }),
                    availableUsers: update(availableUsers, { $splice: [[index, 1]] }),
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
        const { availableOutlets, outlets } = this.state;
        const outlet = availableOutlets[index];

        if (outlet !== null) {
            if (find(outlets, ['id', outlet.id]) === undefined) {
                this.setState({
                    outlets: update(outlets, { $push: [outlet] }),
                    availableOutlets: update(availableOutlets, { $splice: [[index, 1]] }),
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
            // Keep the filtered list updated
            users: update(this.state.users, { $splice: [[index, 1]] }),
            // Add the user back to the autocomplete list
            availableUsers: update(this.state.availableUsers, { $push: [user] }),
            updatePurchases: true,
        });
    }

	/**
	 * Remove outlet from filter
	 * @param {string} outletToRemove A title string of the outlet
	 * @param {int} index index in the array
	 */
    removeOutlet = (outletToRemove, index) => {
        const outlet = this.state.outlets[index];

        this.setState({
            // Keep the filtered list updated
            outlets: update(this.state.outlets, { $splice: [[index, 1]] }),
            // Add the user back to the autocomplete list
            availableOutlets: update(this.state.availableOutlets, { $push: [outlet] }),
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
            .map((outlet) => 'outlet_ids[]=' + outlet.id)
            .join('&');

        const users = this.state.users
            .map(user => 'user_ids[]=' + user.id).join('&');

        const u = encodeURIComponent(`/purchase/report?${oultets}${users}`);

        const url = `/scripts/report?u=${u}&e=Failed`;

        window.open(url, '_blank');
    }

    renderTab() {
        const { activeTab, updatePurchases } = this.state;
        switch (activeTab.toLowerCase()) {
            case 'outlets':
                // return (
                //     <Outlets />
                // );
            case 'summary':
            default:
                return (
                    <Summary
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
            availableOutlets,
            availableUsers,
            activeTab,
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
                        tagList={map(availableOutlets, 'title')}
                        filterList={map(outlets, 'title')}
                        onTagInput={this.findOutlets}
                        onTagAdd={this.addOutlet}
                        onTagRemove={this.removeOutlet}
                        key="outletsFilter"
                    />

                    <TagFilter
                        text="Users"
                        tagList={map(availableUsers, 'full_name')}
                        filterList={map(users, 'full_name')}
                        onTagInput={this.findUsers}
                        onTagAdd={this.addUser}
                        onTagRemove={this.removeUser}
                        key="usersFilter"
                    />
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
