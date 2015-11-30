import React from 'react'
import ReactDOM from 'react-dom'
import App from './app'
import TopBar from '../components/topbar'
import PurchasesBody from '../components/purchases-body'

class Purchases extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			purchases: []
		}

		this.getPurchases = this.getPurchases.bind(this);
		this.getMorePurchases = this.getMorePurchases.bind(this);
	}

	getPurchases() {
		$.get('/scripts/outlet/purchases/list?limit=20&offset=0&details=true', (purchases) => {
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

	getPurchasesPage(offset, cb) {
		$.get('/scripts/outlet/purchaseslist?limit=20&offset=' + offset, (purchases) => {
			var currentPurchases = [];
			this.state.purchases.map(purchase => currentPurchases.push);
			purchases.data.map(purchase => currentPurchases.push);

			this.setState({
				purchases: currentPurchases
			});

			cb();
		});
	}

	getMorePurchases(offset, cb) {
		$.get('/scripts/outlet/purchases/list?limit=20&offset=' + offset, (purchases) => {
			var currentPurchases = [];
			this.state.purchases.map(purchase => currentPurchases.push(purchase));
			purchases.data.map(purchase => currentPurchases.push(purchase));

			this.setState({
				purchases: currentPurchases
			});

			cb();
		});
	}

	componentDidMount() {
	 	this.getPurchases();
	}

	render() {
		return (
			<App user={this.props.user}>
				<TopBar 
					title="Purchases" />
				<PurchasesBody
					purchases={this.state.purchases}
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