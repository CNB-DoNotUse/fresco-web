import _ from 'lodash'
import React from 'react'
import ReactDOM from 'react-dom'
import App from './app'
import TopBar from '../components/topbar'
import PurchasesBody from '../components/purchases/purchases-body'
import TagFilter from '../components/topbar/tag-filter'

class Purchases extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			outlets: [],
			users: [],
			availableOutlets: [],
			availableUsers: [],
			updatePurchases: false,
		}

		this.findOutlets = this.findOutlets.bind(this);
		this.findUsers = this.findUsers.bind(this);
		this.addOutlet = this.addOutlet.bind(this);
		this.addUser = this.addUser.bind(this);
		this.removeUser = this.removeUser.bind(this);
		this.removeOutlet = this.removeOutlet.bind(this);
		this.loadStats = this.loadStats.bind(this);
		this.loadPurchases = this.loadPurchases.bind(this);
		this.downloadExports = this.downloadExports.bind(this);
	}

	componentDidUpdate(prevProps, prevState) {
		//Check if outlets are the same
		if (JSON.stringify(prevState.outlets) != JSON.stringify(this.state.outlets)) {
			this.setState({
				updatePurchases: true
			});
		}
	}

	findOutlets(q) {
		if(q.length == 0) {
			this.setState({
				availableOutlets: []
			});
		} else{
			const params = {
				outlets: { a: { title: q} }
			};

			$.ajax({
				url: '/api/search',
				type: 'GET',
				data: $.param(params),
				success: (response, status, xhr) => {
					if(!response.error && response.outlets) {
						this.setState({
							availableOutlets: response.outlets.results
						});
					}
				}
			});	
		}
	}

	findUsers(q) {
		if(q.length == 0) {
			this.setState({
				availableUsers: []
			});
		} else{
			const params = {
				users: { a: { full_name : q} }
			};

			$.ajax({
				url: '/api/search',
				type: 'GET',
				data: $.param(params),
				success: (response, status, xhr) => {
					if(!response.error && response.users) {
						this.setState({
							availableUsers: response.users.results
						});
					}
				}
			});	
		}
	}

	/**
	 * Adds user to filter
	 * @param {string} userToAdd email of the user
	 */
	addUser(userToAdd, index) {
		const { availableUsers, users } = _.clone(this.state);
		const user = availableUsers[index];

		if(user !== null) {
			if(_.find(users, ['id', user.id]) == undefined){
				console.log(user)
				this.setState({ 
					users: _.concat(users, user) 
				});
			}
		}
	}


	/**
	 * Adds outlet to filter
	 * @param {string} outletToAdd String title of the outlet
	 */
	addOutlet(outletToAdd, index) {
		const { availableOutlets, outlets } = _.clone(this.state);
		const outlet = availableOutlets[index];

		if(outlet !== null) {
			if(_.find(outlets, ['id', outlet.id]) == undefined){
				this.setState({ 
					outlets: _.concat(outlets, outlet) 
				});
			}
		}
	}

	/**
	 * Remove user from filter
	 * @param {string} userToRemove An email string of the user
	 */
	removeUser(userToRemove, index) {
		const users = _.clone(this.state.users);

		console.log(users.length)

		console.log(users);

		let newUsers = users.splice(1, 1);

		console.log(newUsers);

		// this.setState({ 
		// 	users: newUsers
		// });
	}

	/**
	 * Remove outlet from filter
	 * @param {string} outletToRemove A title string of the outlet
	 */
	removeOutlet(outletToRemove, index) {
		this.setState({ 
			outlets: _.pullAt(this.state.outlets, [index])
		});
	}

	/**
	 * Loads stats for purchases
	 */
	loadStats(callback) {
		const params = {
			outlet_ids: _.map(this.state.outlets, 'id'),
			user_ids: _.map(this.state.users, 'id')
		}

		$.ajax({
			url: '/api/purchase/stats',
			type: 'GET',
			data: $.param(params),
			success: (response, status, xhr) => {
				if(response.err || !response) {
					return $.snackbar({
						content: 'There was an error receiving purchases!'
					});
				} else {
					callback(response);
				}
			}
		});	
	}

	/**
	 * Requests purchases from server
	 * @return {[type]} [description]
	 */
	loadPurchases(last = null, cb) {
		//Update state for purchase list if needed so it doesn't loop
		if(this.state.updatePurchases){
			this.setState({
				updatePurchases: false
			});
		}

		const params = {
			outlet_ids: _.map(this.state.outlets, 'id'),
			user_ids: _.map(this.state.users, 'id'),
			limit: 20,
			last
		}

		$.ajax({
			url: '/api/purchase/list',
			type: 'GET',
			data: $.param(params),
			success: (response, status, xhr) => {
				if(response.err || !response) {
					return $.snackbar({
						content: 'There was an error receiving purchases!'
					});
				} else {
					cb(response);
				}
			}
		});	
	}

	downloadExports(format) {
		const filterOutletText = this.state.outlets.map((outlet) => {
			return 'outlet[]='+ outlet._id
		}).join('&');

		const url = `/scripts/outlet/export?${filterOutletText}`;

		window.open(url, '_blank');
	}

	render() {
		const outlets = _.map(this.state.outlets, 'title');
		const availableOutlets =_.map(this.state.availableOutlets, 'title');
		const users = _.map(this.state.users, 'full_name');
		const availableUsers = _.map(this.state.availableUsers, 'full_name');

		return (
			<App user={this.props.user}>
				<TopBar 
					title="Purchases">

					<TagFilter
						text="Outlets"
						tagList={availableOutlets}
						filterList={outlets}
						onTagInput={this.findOutlets}
						onTagAdd={this.addOutlet}
						onTagRemove={this.removeOutlet}
						key="outletsFilter" />

					<TagFilter
						text="Users"
						tagList={availableUsers}
						filterList={users}
						onTagInput={this.findUsers}
						onTagAdd={this.addUser}
						onTagRemove={this.removeUser}
						key="usersFilter" />
				</TopBar>

				<PurchasesBody
					updatePurchases={this.state.updatePurchases}
					downloadExports={this.downloadExports}
					loadPurchases={this.loadPurchases}
					loadStats={this.loadStats} />
			</App>
		)
	}
}

ReactDOM.render(
  <Purchases
	user={window.__initialProps__.user} />,
	document.getElementById('app')
);