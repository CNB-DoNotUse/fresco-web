import _ from 'lodash'
import React from 'react'
import ReactDOM from 'react-dom'
import App from './app'
import TopBar from '../components/topbar'
import PurchasesBody from '../components/purchases/purchases-body'

class Purchases extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			purchases: [],
			outlets: [],
			filterOutlets: []
		}

		this.getOutlets = this.getOutlets.bind(this);

		this.filterAdd = this.filterAdd.bind(this);
		this.filterRemove = this.filterRemove.bind(this);

		this.getPurchases = this.getPurchases.bind(this);
		this.getMorePurchases = this.getMorePurchases.bind(this);

		this.downloadExports = this.downloadExports.bind(this);
	}

	getOutlets() {
		$.get('/scripts/outlet/list', (outlets) => {

			if(outlets.err) { return $.snackbar({content: outlets.err}); }
			this.setState({
				outlets: outlets.data
			});
		})
	}

	filterAdd(outlet) {

		var filterOutlets = _.clone(this.state.filterOutlets, true);
		var outlets = _.clone(this.state.outlets, true);

		for (var o in outlets) {
			if(outlets[o].title == outlet) {
				filterOutlets.push(outlets[o]);
			}
		}

		this.setState({
			filterOutlets: filterOutlets
		});
	}

	filterRemove(outlet) {

		var filterOutlets = _.clone(this.state.filterOutlets, true),
			filterIdsArr = [];

		for(var o in filterOutlets) {
			if(filterOutlets[o].title == outlet) {
				filterIdsArr.push(filterOutlets[o]._id);
			}
		}

		for(var o = filterOutlets.length - 1; o >= 0; o--) {
			if(filterIdsArr.indexOf(filterOutlets[o]._id) != -1) {
				filterOutlets.splice(o, 1);
			}
		}

		this.setState({
			filterOutlets: filterOutlets
		});

	}

	getPurchases() {
		$.get('/scripts/outlet/purchases/list', {
			limit: 20,
			offset: 0,
			details: true,
			outlets: this.state.filterOutlets.map(p => p._id)
		}, (purchases) => {
			if(purchases.err) {
				return $.snackbar({
					content: purchases.err
				});
			}

			if(!purchases.data) return;

			this.setState({
				purchases: purchases.data
			});
		});
	}

	getMorePurchases(offset, cb) {
		$.get('/scripts/outlet/purchases/list', {
			limit: 20,
			offset: offset,
			outlet: this.state.filterOutlets.map((outlet) => { return 'outlet[]='+ outlet._id }).join('&')
		}, (purchases) => {
			var currentPurchases = [];
			this.state.purchases.map(purchase => currentPurchases.push(purchase));
			purchases.data.map(purchase => currentPurchases.push(purchase));

			this.setState({
				purchases: currentPurchases
			});
			cb();
		});
	}

	downloadExports(format) {

		var filterOutletText = this.state.filterOutlets.map((outlet) => {
			return 'outlet[]='+ outlet._id
		}).join('&');

		var url = "/scripts/outlet/export?format=" + format + '&' + filterOutletText;

		window.open(url, '_blank');
	}

	componentDidMount() {
	 	this.getPurchases();
	 	this.getOutlets();
	}

	componentDidUpdate(prevProps, prevState) {
		if (JSON.stringify(prevState.filterOutlets) != JSON.stringify(this.state.filterOutlets)) {
			this.getPurchases();
		}
	}

	render() {

		var outlets = [],
			filters = _.clone(this.state.filterOutlets, true),
			filterIDs = filters.map(f => f._id),
			filterNames = filters.map(f => f.title);

		for (var o in this.state.outlets) {
			var outlet = this.state.outlets[o];

			if(filterIDs.indexOf(outlet._id) == -1) {
				outlets.push(outlet.title);
			}
		}

		return (
			<App user={this.props.user}>
				<TopBar 
					title="Purchases"
					outletsFilter={true}
					outlets={outlets}
					outletFilterList={filterNames}
					onOutletFilterAdd={this.filterAdd}
					onOutletFilterRemove={this.filterRemove} />
				<PurchasesBody
					purchases={this.state.purchases}
					downloadExports={this.downloadExports}
					getMorePurchases={this.getMorePurchases} />
			</App>
		)
	}
}

ReactDOM.render(
  <Purchases
  	user={window.__initialProps__.user} />,
	document.getElementById('app')
);