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
			updatePurchases: false,
		}

		this.findOutlets = this.findOutlets.bind(this);
		this.addOutlet = this.addOutlet.bind(this);
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

	findOutlets(query) {
		if(query.length == 0) {
			this.setState({
				availableOutlets: []
			});
		} else{
			const params = {
				q: query
			}

			$.ajax({
				url: '/api/search',
				type: 'GET',
				data: $.param({ outlets: params }),
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

	/**
	 * Adds outlet to filter
	 */
	addOutlet(outletToAdd) {
		console.log(outletToAdd);

		let availableOutlets = _.clone(this.state.availableOutlets, true);
		let outlets = _.clone(this.state.outlets, true);
		let outlet = null;
		let outletExists = false;

		//Find the outlet object based on the `title`, outletToAdd is just a `string`
		for (var i = 0; i < availableOutlets.length; i++) {
			outlet = availableOutlets[i];

			if(outlet.title == outletToAdd){
				outlet = availableOutlets[i];
				break;
			}
		}

		//Check that the outlet isn't already in the list
		for (var i = 0; i < outlets.length; i++) {
			if(outlets[i]._id === outlet._id){
				outletExists = true;
				break;
			}
		}

		if(!outletExists && outlet !== null){
			outlets.push(outlet);
			this.setState({ outlets: outlets });
		}
	}

	/**
	 * Remove outlet from filter
	 * @param {string} outletToRemove A title string of the outlet
	 */
	removeOutlet(outletToRemove) {
		const outlets = _.filter(this.state.outlets, (o) => { 
			return o.title !== outletToRemove; 
		});

		this.setState({ outlets });
	}

	/**
	 * Loads stats for purchases
	 */
	loadStats(callback) {
		$.get('/api/outlet/purchases/stats', {
			outlets: this.state.outlets.map(p => p._id)
		}, (response) => {
			if(response.err || !response.data) {
				return $.snackbar({
					content: 'There was an error receiving the purchases'
				});
			}

			callback(response.data);
		});
	}

	/**
	 * Requests purchases from server
	 * @return {[type]} [description]
	 */
	loadPurchases(passedOffset, cb) {
		//Update state for purchase list if needed so it doesn't loop
		if(this.state.updatePurchases){
			this.setState({
				updatePurchases: false
			});
		}

		$.get('/api/outlet/purchases/list', {
			limit: 20,
			offset: passedOffset,
			details: true,
			outlets: this.state.outlets.map(outlet => outlet._id)
		}, (response) => {
			if(response.err) {
				return $.snackbar({
					content: 'There was an error receiving the purchases'
				});
			} else if(!response.data){
				return;
			}

			var purchases = response.data.map((purchaseParent) => {
				var purchase = purchaseParent.purchase;
					purchase.title = purchaseParent.title;

				return purchase;
			});

			if(cb) cb(purchases);

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
		const outlets = this.state.outlets.map(outlet => outlet.title);
		const availableOutlets = this.state.availableOutlets.map(outlet => outlet.title);

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