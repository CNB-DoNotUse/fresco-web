import React from 'react'
import PurchasesList from './purchases-list'
import PurchasesStats from './purchases-stats'

export default class PurchasesBody extends React.Component {

	constructor(props) {
		super(props);
		
		this.state = {

		}
	}

	render() {
		return (
			<div className="container-fluid fat grid">
				<PurchasesList
					purchases={this.props.purchases}
					getMorePurchases={this.props.getMorePurchases} />
				<PurchasesStats purchases={this.props.purchases} />
			</div>
		);
	}
}

PurchasesBody.defaultProps = {
	purchases: []
}