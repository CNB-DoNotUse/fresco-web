import React from 'react'
import PurchasesListItem from './purchases-list-item'

export default class PurchasesList extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			isGettingMorePurchases: false,
			offset: 0
		}

		this.onScroll = this.onScroll.bind(this);

	}

	// Handle purchases div scrollß
	onScroll(e) {

		if(this.state.isGettingMorePurchases) return;

		// Get scroll offset and get more purchases if necessary.
		var purchasesListDiv = document.getElementById('purchases-list');
		var pxToBottom = purchasesListDiv.scrollHeight - (purchasesListDiv.clientHeight + purchasesListDiv.scrollTop);
		var shouldGetMorePurchases = pxToBottom <= 96;
		
		// Check if already getting purchases because async
		if(shouldGetMorePurchases) {

			this.setState({
				isGettingMorePurchases: true
			});

			// Pass current offset to getMorePurchases
			this.props.getMorePurchases(this.state.offset, () => {

				// Allow getting more purchases after we've gotten more purchases.
				// Update offset to new purchases length
				this.setState({
					isGettingMorePurchases: false,
					offset: this.props.purchases.length
				});
			});
		}
	}

	render() {

		var purchasesListItems = []
		var purchases = this.props.purchases;

		// Map purchases JSON to PurchaseListItem
		purchases.map((purchase, i) => {
			purchasesListItems.push(
				<PurchasesListItem purchase={purchase.purchase} title={purchase.title} key={i} />
			);
		})

		return (
			<div id="purchases-list" className="col-md-8 col-xs-12 list" onScroll={this.onScroll}>
				{purchasesListItems}
			</div>
		);
	}
}