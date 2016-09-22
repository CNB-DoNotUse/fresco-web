import React, { PropTypes, Component } from 'react'
import PurchasesListItem from 'purchases-list-item'
import last from 'lodash/last';

/**
 * Displays a list of purchase objects
 */
class PurchasesList extends Component {

	constructor(props) {
		super(props);

		this.state = {
			loading: false,
			offset: 0,
			scrollable: true,
			purchases: []
		}

		this.loadPurchases = this.loadPurchases.bind(this);
	}

	componentDidMount() {
	    //Load purchases when component first mounts
	    this.loadPurchases();
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
		this.props.loadPurchases(null, (purchases) => {
			//Set posts & callback from successful response
			this.setState({ purchases });
		});  
	}

	// Handle purchases div scroll
	scroll(e) {
		if(this.state.loading) return;

		const grid = e.target;
		const bottomReached = grid.scrollTop > ((grid.scrollHeight - grid.offsetHeight ) - 96);
		
		// Check if already getting purchases because async
		if(bottomReached) {
			this.setState({
				loading: true
			});

			// Pass current offset to getMorePurchases
			this.props.loadPurchases(last(this.state.purchases).id, (purchases) => {
				//Disables scroll, and returns if purchases are empty
				if(!purchases || purchases.length == 0){ 
					return this.setState({
						scrollable: false
					});
				}

				// Allow getting more purchases after we've gotten more purchases.
				// Update offset to new purchases length
				this.setState({
					loading: false,
					purchases: this.state.purchases.concat(purchases)
				});
			});
		}
	}

	render() {
		return (
			<div 
				id="purchases-list" 
				className="col-md-8 col-xs-12 list" 
				onScroll={this.state.scrollable ? (e) => this.scroll(e) : null}
			>
				{this.state.purchases.map((purchase, i) => {
					return (
						<PurchasesListItem 
							purchase={purchase} 
							title={purchase.title} 
							showTitle={true}
							key={i} />
					);
				})}
			</div>
		);
	}
}

PurchasesList.propTypes = {
    purchases: PropTypes.array
};

PurchasesList.defaultProps = {
	loadPurchases: () => {}
}

export default PurchasesList;