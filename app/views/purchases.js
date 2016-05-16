import _ from 'lodash'
import React from 'react'
import ReactDOM from 'react-dom'
import App from './app'
import TopBar from '../components/topbar'
import PurchasesSummary from '../components/purchases/purchases-summary'
import OutletPurchases from '../components/purchases/purchases-outlets'
import Dropdown from '../components/global/dropdown'
import TagFilter from '../components/topbar/tag-filter'

class Purchases extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			outlets: [],
			availableOutlets: [],
			updatePurchases: false,
			selectedTimeToggle: null,
			activeTab: 'Summary'
		}

		this.findOutlets = this.findOutlets.bind(this);
		this.addOutlet = this.addOutlet.bind(this);
		this.loadPurchases = this.loadPurchases.bind(this);
		this.loadStats = this.loadStats.bind(this);
		this.removeOutlet = this.removeOutlet.bind(this);
		this.setActiveTab = this.setActiveTab.bind(this);
		this.timeToggleSelected = this.timeToggleSelected.bind(this);
	}

	componentDidUpdate(prevProps, prevState) {
		//Check if outlets are the same
		if (JSON.stringify(prevState.outlets) != JSON.stringify(this.state.outlets)) {
			this.setState({
				updatePurchases: true
			});
		}
	}

	setActiveTab(tab) {
		this.setState({
			activeTab: tab
		});
	}

	/**
	 * Gets search results for query and sets to state the outlets
	 * @param  {String} query query for the outlet
	 */
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
	 * @param {String} outletToAdd Title of the outlet
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

	loadPurchases(passedOffset, cb) {
		$.get('/api/outlet/purchases/list', {
			limit: 20,
			offset: passedOffset,
			details: true,
			outlets: this.state.outlets.map(o => o._id)
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

	timeToggleSelected(selected) {
		this.setState({
			selectedTimeToggle: selected
		})
	}

	render() {
		var isSummary = this.state.activeTab == 'Summary';

		return (
			<App user={this.props.user}>
				<TopBar 
					title="Purchases"
					activeTab={this.state.activeTab}
					setActiveTab={this.setActiveTab}
					tabs={['Summary', 'Purchases']}
				>	
					{isSummary ? 
		                [
		                	<TagFilter
			                	text="Outlets"
			                	tagList={ this.state.availableOutlets.map( o => o.title ) }
			                	filterList={ this.state.outlets.map( o => o.title )}
			                	onTagInput={this.findOutlets}
			                	onTagAdd={this.addOutlet}
			                	onTagRemove={this.removeOutlet}
			                	key="outletsFilter" />
	                	]:[
							<Dropdown
			                    options={['today so far', 'last 24 hours', 'last 7 days', 'last 30 days', 'this year', 'all time']}
			                    selected='today so far'
			                    onSelected={this.timeToggleSelected}
			                    key="timeToggle"
			                    inList={true}>
			                </Dropdown>
		                ]
					}
				</TopBar>

				<div className="container-fluid tabs">
					<div className={isSummary ? 'tab tab-summary toggled' : 'tab tab-summary'}>
						<PurchasesSummary 
							loadStats={this.loadStats}
							loadPurchases={this.loadPurchases}
							updatePurchases={this.state.updatePurchases} />
					</div>

					<div className={isSummary ? 'tab tab-outlets' : 'tab tab-outlets toggled'}>
						<OutletPurchases 
							outletIds={this.state.outlets.map(o => o._id)}
							selectedTimeToggle={this.state.selectedTimeToggle} />
					</div>
				</div>
			</App>
		)
	}
}

ReactDOM.render(
  <Purchases
  	user={window.__initialProps__.user} />,
	document.getElementById('app')
);
