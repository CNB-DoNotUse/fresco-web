import React from 'react'
import PurchasesListItem from './purchases-list-item'

export default class PurchasesList extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			loading: false,
			offset: 0,
			purchases: this.props.purchases
		}

		this.loadPurchases = this.loadPurchases.bind(this);
		this.scroll = this.scroll.bind(this);
	}

	componentDidUpdate(prevProps, prevState) {
		//Tell the component to update it's purchases
		if(this.props.updatePurchases) {
			this.loadPurchases();
		}
	}

	/**
	 * Loads initial set of purchases
	 */
	loadPurchases() {
		//Access parent var load method
		this.props.loadPurchases(0, (purchases) => {
			
			//Update offset based on purchases from callaback
			var offset = purchases ? purchases.length : 0;

			//Set posts & callback from successful response
			this.setState({
				purchases: purchases,
				offset : offset
			});
		});  
	}

	componentDidMount() {
	    //Check if list is initialzied with posts or the `loadPurchases` prop is not defined, then don't load anything
	    if(this.state.purchases.length > 0 || !this.props.loadPurchases) 
	    	return;
	    
	    //Load purchases when component first mounts
	    this.loadPurchases();
	}

	// Handle purchases div scroll
	scroll(e) {

		if(this.state.loading) return;

		// Get scroll offset and get more purchases if necessary.
		var purchasesListDiv = document.getElementById('purchases-list');
		var pxToBottom = purchasesListDiv.scrollHeight - (purchasesListDiv.clientHeight + purchasesListDiv.scrollTop);
		var shouldGetMorePurchases = pxToBottom <= 96;
		
		// Check if already getting purchases because async
		if(shouldGetMorePurchases) {
			this.setState({
				loading: true
			});


			console.log('LOADING MORE');

			// Pass current offset to getMorePurchases
			this.props.loadPurchases(this.state.offset, (purchases) => {

				//Disables scroll, and returns if purchases are empty
				if(!purchases || purchases.length == 0){ 
					this.setState({
						scrollable: false
					});
					return;
				}

				var offset = this.state.purchases.length + purchases.length;

				// Allow getting more purchases after we've gotten more purchases.
				// Update offset to new purchases length
				this.setState({
					loading: false,
					purchases: this.state.purchases.concat(purchases),
					offset: offset
				});

			});
		}
	}

	render() {

		// Map purchases JSON to PurchaseListItem
		var purchases = this.state.purchases.map((purchase, i) => {
		
			return <PurchasesListItem purchase={purchase} title={purchase.title} key={i} />
		
		});

		return (
			<div id="purchases-list" className="col-md-8 col-xs-12 list" onScroll={this.props.scrollable ? this.scroll : null}>
				{purchases}
			</div>
		);
	}
}

PurchasesList.defaultProps= {
	purchases: [],
	scrollable: false
}