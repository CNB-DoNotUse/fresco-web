import React from 'react'
import moment from 'moment'

export default class PurchasesStats extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			stats: this.props.stats
		}

		this.loadStats = this.loadStats.bind(this);
	}

	componentDidMount() {
	    //Load stats when component first mounts
	    this.loadStats();  
	}

	componentDidUpdate(prevProps, prevState) {
		//Tell the component to update its purchases
		if(this.props.updatePurchases) {
			this.loadStats();
		}
	}

	/**
	 * Loads stats for purchases
	 */
	loadStats() {
		//Access parent var load method
		this.props.loadStats((stats) => {
			if(Object.keys(stats).length === 0){
				this.setState({ stats: this.props.stats })
			} else {
				this.setState({
					stats: stats
				});
			}
		});  
	}

	render() {
		const { downloadExports, emailStatement } = this.props;

		const { last_day, last_7days, last_30days, total_revenue } = this.state.stats;

		return (
			<div className="col-md-4">
				<h3 className="md-type-button md-type-black-secondary">Total purchases</h3>
				
				<ul className="md-type-subhead">
					<li>
						<span>${last_day / 100}</span>
						<span className="md-type-caption"> last 24 hours</span>
					</li>
					<li>
						<span>${last_7days / 100}</span>
						<span className="md-type-caption"> last 7 days</span>
					</li>
					<li>
						<span>${last_30days / 100}</span>
						<span className="md-type-caption"> last 30 days</span>
					</li>

					<li>
						<span>${total_revenue / 100}</span>
						<span className="md-type-caption"> total</span>
					</li>
				</ul>

				<button 
					id="export-csv" 
					type="button" 
					className="btn" 
					onClick={downloadExports.bind(null, 'csv')}>Export to .csv</button>

				<button 
					id="email-statement-button" 
					type="button" 
					className="btn" 
					onClick={emailStatement}>Email my statement</button>
			</div>
		);
	}
}

PurchasesStats.defaultProps = {
	stats: {	
		last_day: 0,
		last_7days: 0,
		last_30days: 0,
		total_revenue: 0
	}
}