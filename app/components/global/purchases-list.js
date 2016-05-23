import React from 'react'
import PurchasesListItem from './purchases-list-item'

export default class PurchasesList extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			loading: false,
			purchases: this.props.purchases,
			scrollable: true
		}

		this.loadPurchases = this.loadPurchases.bind(this);
		this.scroll = this.scroll.bind(this);
	}

	componentDidMount() {
	    //Check if list is initialzied with posts or the `getPurchases` prop is not defined, then don't load anything
	    if(this.state.purchases.length > 0 || !this.props.getPurchases) 
	    	return;
	    
	    //Load purchases when component first mounts
	    this.loadPurchases();
	}

	componentWillReceiveProps(nextProps) {
		//Tell the component to update it's purchases
		if(nextProps.updatePurchases) {
			this.loadPurchases();
		}
	}

	loadPurchases() {
		//Access parent var load method
		this.props.getPurchases(0, (purchases) => {
			//Set posts & callback from successful response
			this.setState({
				purchases: purchases,
				scrollable: true
			});
		});  
	}

	//Handle purchases div scroll
	scroll(e) {
		var grid = e.target,
			bottomReached = grid.scrollTop > ((grid.scrollHeight - grid.offsetHeight ) - 400);

		//Check that nothing is loading and that we're at the end of the scroll,
		//and that we have a parent bind to load  more posts
		if(!this.loading && bottomReached){
			this.loading = true;

			// Pass current offset to getPurchases
			this.props.getPurchases(this.state.purchases.length, (purchases) => {
				//Disables scroll, and returns if purchases are empty
				if(!purchases || purchases.length == 0){ 
					return this.setState({
						scrollable: false
					});
				}

				//Disabling loading on object
				this.loading = false;

				// Allow getting more purchases after we've gotten more purchases.
				this.setState({
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
				onScroll={this.state.scrollable ? this.scroll : null} >
				{this.state.purchases.map((purchase, i) => {
					return <PurchasesListItem 
								purchase={purchase} 
								title={purchase.title} 
								key={i} 
							/>
				})}
			</div>
		);
	}
}

PurchasesList.defaultProps= {
	purchases: []
}