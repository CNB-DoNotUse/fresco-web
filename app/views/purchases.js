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
			updatePurchases: false,
			filterOutlets: []
		}

		this.getOutlets = this.getOutlets.bind(this);
		this.filterAdd = this.filterAdd.bind(this);
		this.filterRemove = this.filterRemove.bind(this);
		this.loadPurchases = this.loadPurchases.bind(this);
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
		var filterOutlets = _.clone(this.state.filterOutlets, true),
			outlets = _.clone(this.state.outlets, true);

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
			outlets: this.state.filterOutlets.map(p => p._id)
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
		var filterOutletText = this.state.filterOutlets.map((outlet) => {
			return 'outlet[]='+ outlet._id
		}).join('&');

		var url = "/scripts/outlet/export?format=" + format + '&' + filterOutletText;

		window.open(url, '_blank');
	}

	componentDidMount() {
	 	this.getOutlets();
	}

	componentDidUpdate(prevProps, prevState) {
		//Check if outlets are the same
		if (JSON.stringify(prevState.filterOutlets) != JSON.stringify(this.state.filterOutlets)) {
			this.setState({
				updatePurchases: true
			});
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
					title="Purchases">

					<TagFilter
						text="Outlets"
						tagList={outlets}
						filterList={filterNames}
						onTagAdd={this.filterAdd}
						onTagRemove={this.filterRemove}
						key="outletsFilter" />
				</TopBar>
				<PurchasesBody
					updatePurchases={this.state.updatePurchases}
					downloadExports={this.downloadExports}
					loadPurchases={this.loadPurchases} />
			</App>
		)
	}
}

ReactDOM.render(
  <Purchases
  	user={window.__initialProps__.user} />,
	document.getElementById('app')
);