import React from 'react'
import PurchasesList from '../global/purchases-list'
import PurchasesStats from './purchases-stats'

export default class PurchasesBody extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			purchases: []
		}

		this.purchasesAdded = this.purchasesAdded.bind(this);
	}

	/**
	 * Optional Listener for purchase list for sending purchases to other components
	 */
	purchasesAdded(purchases) {
		this.setState({
			purchases: purchases
		});
	}

	render() {

		return (
			<div className="container-fluid fat grid">
				<PurchasesList
					scrollable={true}
					updatePurchases={this.props.updatePurchases}
					purchasesAdded={this.purchasesAdded}
					loadPurchases={this.props.loadPurchases} />
				<PurchasesStats 
					purchases={this.state.purchases} 
					emailStatement={this.props.emailStatement}
					downloadExports={this.props.downloadExports} />
			</div>
		);
	}
}

PurchasesBody.defaultProps = {
	purchases: [],
	updatePurchases: false
}