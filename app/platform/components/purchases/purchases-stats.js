import React from 'react'
import moment from 'moment'

export default class PurchasesStats extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			day: 0,
			week: 0,
			month: 0
		}

		this.loadStats = this.loadStats.bind(this);
	}

	componentDidMount() {
	    //Load stats when component first mounts
	    this.loadStats();  
	}

	componentDidUpdate(prevProps, prevState) {
		//Tell the component to update it's purchases
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
			this.setState(stats);
		});  
	}

	render() {
		let buttons = [];
		let key = 0;

		const { downloadExports, emailStatement } = this.props;

		console.log(this.state);

		return (
			<div className="col-md-4">
				<h3 className="md-type-button md-type-black-secondary">Total purchases</h3>
				
				<ul className="md-type-subhead">
					<li>
						<span>${this.state.last_day / 100}</span>
						<span className="md-type-caption"> last 24 hours</span>
					</li>
					<li>
						<span>${this.state.last_7days / 100}</span>
						<span className="md-type-caption"> last 7 days</span>
					</li>
					<li>
						<span>${this.state.last_30days / 100}</span>
						<span className="md-type-caption"> last 30 days</span>
					</li>
				</ul>

				<button 
					id="export-csv" 
					type="button" 
					className="btn" 
					key={++key}
					onClick={downloadExports.bind(null, 'csv')}>Export to .csv</button>

				<button 
					id="email-statement-button" 
					type="button" 
					className="btn" 
					key={++key}
					onClick={emailStatement}>Email my statement</button>
			</div>
		);
	}
}