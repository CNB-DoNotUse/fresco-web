import React from 'react'
import PurchasesList from '../global/purchases-list'
import PurchasesStats from './purchases-stats'

export default class PurchasesSummary extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div className="container-fluid fat grid">
				<PurchasesList
					updatePurchases={this.props.updatePurchases}
					getPurchases={this.props.getPurchases} />
				
				<PurchasesStats 
					emailStatement={this.props.emailStatement}
					downloadExports={this.props.downloadExports}
					getStats={this.props.getStats}
					updatePurchases={this.props.updatePurchases} />
			</div>
		);
	}
}

PurchasesSummary.defaultProps = {
	purchases: [],
	updatePurchases: false
}