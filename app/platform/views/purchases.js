import React from 'react';
import update from 'react-addons-update';
import ReactDOM from 'react-dom';
import find from 'lodash/find';
import map from 'lodash/map';
import differenceBy from 'lodash/differenceBy';
import api from 'app/lib/api';
import { createGetFromStorage, createSetInStorage } from 'app/lib/storage';
import 'app/sass/platform/_purchases.scss';
import App from './app';
import TopBar from '../components/topbar';
import ListWithStats from '../components/purchases/list-with-stats';
import Outlets from '../components/purchases/outlets';
import TagFilter from '../components/topbar/tag-filter';
import Dropdown from '../components/global/dropdown';

const getFromStorage = createGetFromStorage({ type: 'local', key: 'purchases' });
const setInStorage = createSetInStorage({ type: 'local', key: 'purchases' });

/**
 * Admin Purchases page
 */
class Purchases extends React.Component {
    state = {
        outlets: getFromStorage('outlets') || [],
        users: [],
        availableOutlets: [],
        availableUsers: [],
        updatePurchases: false,
        activeTab: 'Summary',
        outletStatsTime: 'today so far',
    };

    findOutlets = (q) => {
        if (q.length === 0) {
            this.setState({ availableOutlets: [] });
        } else {
            const params = { outlets: { a: { title: q } } };

            api
            .get('search', params)
            .then(res => {
                this.setState({ availableOutlets:
                    differenceBy(res.outlets.results, this.state.outlets, 'id') });
            })
            .catch(err => err);
        }
    }

    findUsers = (q) => {
        if (q.length === 0) {
            this.setState({ availableUsers: [] });
        } else {
            const params = { users: { a: { full_name: q } } };

            api
            .get('search', params)
            .then(res => {
                this.setState({
                    availableUsers: res.users.results,
                });
            })
            .catch(err => err);
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
            if(find(users, ['id', user.id]) == undefined){
                this.setState({
                    users: update(users, {$push: [user]}),
                    availableUsers: update(availableUsers, {$splice: [[index, 1]]}),
                    updatePurchases: true
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
        if (!outlet) return;

        if(find(outlets, ['id', outlet.id]) === undefined){
            this.setState({
                outlets: update(outlets, {$push: [outlet]}),
                availableOutlets: update(availableOutlets, {$splice: [[index, 1]]}),
                updatePurchases: true
            }, () => {
                setInStorage({ outlets: this.state.outlets });
            });
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
            users: update(this.state.users, {$splice: [[index, 1]]}), //Keep the filtered list updated
            availableUsers: update(this.state.availableUsers, {$push: [user]}), //Add the user back to the autocomplete list
            updatePurchases: true
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
            outlets: update(this.state.outlets, {$splice: [[index, 1]]}),
            // Add the user back to the autocomplete list
            availableOutlets: update(this.state.availableOutlets, {$push: [outlet]}),
            updatePurchases: true,
        }, () => {
            setInStorage({ outlets: this.state.outlets });
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

        api.get('purchase/stats', params)
        .then(res => callback(res))
        .catch(() => $.snackbar({ content: 'There was an error receiving purchases!' }));
    }

    /**
     * Requests purchases from server
     * @return {[type]} [description]
     */
    loadPurchases = ({ last = null, cb }) => {
        //Update state for purchase list if needed so it doesn't loop
        if(this.state.updatePurchases){
            this.setState({
                updatePurchases: false
            });
        }

        const params = {
            outlet_ids: map(this.state.outlets, 'id'),
            user_ids: map(this.state.users, 'id'),
            limit: 20,
            sortBy: 'created_at',
            last
        }

        $.ajax({
            url: '/api/purchase/list',
            type: 'GET',
            data: $.param(params)
        })
        .done(cb)
        .fail((error) => {
            return $.snackbar({
                content: 'There was an error receiving purchases!'
            });
        });
    }

	/**
	 * Sends browser to script to generate CSV
     */
    downloadExports = () => {
        const oultets = this.state.outlets.map((outlet) => {
            return 'outlet_ids[]='+ outlet.id
        }).join('&');

        const users = this.state.users.map((user) => {
            return 'user_ids[]='+ user.id
        }).join('&');

        const u = encodeURIComponent(`/purchase/report?${oultets}${users}`);

        const url = `/scripts/report?u=${u}&e=Failed`;

        window.open(url, '_blank');
    }

    getTabStyle(tab) {
        if (this.state.activeTab === tab) {
            return { display: 'block' };
        }
        return { display: 'none' };
    }

    render() {
        const {
            outlets,
            users,
            searchOutlets,
            searchUsers,
            activeTab,
            outletStatsTime,
            updatePurchases,
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
                        tagList={this.state.availableOutlets}
                        filterList={this.state.outlets}
                        onTagInput={this.findOutlets}
                        onTagAdd={this.addOutlet}
                        onTagRemove={this.removeOutlet}
                        key="outletsFilter"
                        attr={'title'}
                    />

                    {(activeTab === 'Summary') &&
                        <TagFilter
                            text="Users"
                            tagList={this.state.availableUsers}
                            filterList={this.state.users}
                            onTagInput={this.findUsers}
                            onTagAdd={this.addUser}
                            onTagRemove={this.removeUser}
                            key="usersFilter"
                            attr={'full_name'}
                            altAttr={'username'}
                            hasAlt
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
                            onSelected={b => this.setState({ outletStatsTime: b })}
                            key="timeToggle"
                            dropdownClass="purchases__time-dropdown"
                            inList
                        />
                    }
                </TopBar>

                <div style={this.getTabStyle('Summary')}>
                    <ListWithStats
                        updatePurchases={updatePurchases}
                        downloadExports={this.downloadExports}
                        loadPurchases={this.loadPurchases}
                        loadStats={this.loadStats}
                    />
                </div>

                <Outlets
                    style={this.getTabStyle('Outlets')}
                    loadData={activeTab === 'Outlets'}
                    outletIds={this.state.outlets.map(o => o.id)}
                    statsTime={this.state.outletStatsTime}
                />
            </App>
        );
    }
}

ReactDOM.render(
    <Purchases user={window.__initialProps__.user} />,
    document.getElementById('app')
);

