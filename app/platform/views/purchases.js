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
	 * @param {string} outletToAdd String title of the outlet
	 */
	addOutlet(outletToAdd) {
		const { availableOutlets, outlets } = _.clone(this.state);

		//Find the outlet object based on the `title`, outletToAdd is just a `string`
		for (let i = 0; i < availableOutlets.length; i++) {
			let outlet = availableOutlets[i];

			if(outlet.title === outletToAdd) {
				//Check if it exists
				if(_.find(outlets, ['title', outlet.title]) === undefined) {
					this.setState({ 
						outlets: _.concat(outlets, outlet) 
					});
				}

				//Break because we found it, yo
				break;
			}
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
		const params = {
			outlets_ids: _.map(this.state.outlets, 'id')
		}

		$.ajax({
			url: '/api/outlet/purchases/stats',
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