import React from 'react'
import PurchasesList from 'purchases-list'
import PurchasesStats from 'purchases-stats'

export default class PurchasesBody extends React.Component {

	constructor(props) {
		super(props);
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
					emailStatement={this.props.emailStatement}
					downloadExports={this.props.downloadExports}
					loadStats={this.props.loadStats}
					updatePurchases={this.props.updatePurchases} />
			</div>
		);
	}
}

PurchasesBody.defaultProps = {
	purchases: [],
	downloadExports: () => {},
	updatePurchases: false
}