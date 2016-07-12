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
			$.get('/api/outlet/list?q=' + query, (response) => {
				if(!response.err && response.data) {
					this.setState({
						availableOutlets: response.data
					});
				}
			});
		}
	}

	/**
	 * Adds outlet to filter
	 */
	addOutlet(outletToAdd) {
		var availableOutlets = _.clone(this.state.availableOutlets, true),
			outlets = _.clone(this.state.outlets, true),
			outlet = null,
			outletExists = false;

		//Find the outlet object based on the `title`, outletToAdd is just a `string`
		for (var i = 0; i < availableOutlets.length; i++) {
			var outlet = availableOutlets[i];

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
	 */
	removeOutlet(outletToRemove) {
		var outlets = _.clone(this.state.outlets, true),
			filterIdsArr = [];

		for (var i = 0; i < outlets.length; i++) {
			var outlet = outlets[i];

			if(outlet.title == outletToRemove){
				outlets.splice(i, 1);
				break;
			}
		}

		this.setState({ outlets: outlets });
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
			outlets: this.state.outlets.map(p => p._id)
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
		var filterOutletText = this.state.outlets.map((outlet) => {
			return 'outlet[]='+ outlet._id
		}).join('&');

		var url = "/scripts/outlet/export?format=" + format + '&' + filterOutletText;

		window.open(url, '_blank');
	}

	render() {
		var outlets = this.state.outlets.map((outlet) => {
			return outlet.title;
		});

		var availableOutlets = this.state.availableOutlets.map((outlet) =>{
			return outlet.title;
		});

		return (
			<App user={this.props.user}>
				<TopBar 
					title="Purchases">

					<TagFilter
						text="Outlet"
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