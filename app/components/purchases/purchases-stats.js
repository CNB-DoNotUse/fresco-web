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

	componentWillReceiveProps(nextProps) {
		//Tell the component to update it's purchases
		if(nextProps.updatePurchases) {
			this.loadStats();
		}
	}

	/**
	 * Loads stats for purchases
	 */
	loadStats() {
		//Access parent var load method
		this.props.getStats((stats) => {
			this.setState(stats);
		});  
	}

	render() {
		var buttons = [],
			key = 0;

		if(this.props.downloadExports){
			buttons.push(
				<button 
					id="export-xlsx"
					type="button" 
					className="btn"
					key={++key}
					onClick={this.props.downloadExports.bind(null, 'xlsx')}>Export to .xlsx</button>
			);
		};

		if(this.props.downloadExports){
			buttons.push(
				<button 
					id="export-csv" 
					type="button" 
					className="btn" 
					key={++key}
					onClick={this.props.downloadExports.bind(null, 'csv')}>Export to .csv</button>
			);
		}

		if(this.props.emailStatement){
			buttons.push(
				<button 
					id="email-statement-button" 
					type="button" 
					className="btn" 
					key={++key}
					onClick={this.props.emailStatement}>Email my statement</button>
			)
		}

		return (
			<div className="col-md-4">
				<h3 className="md-type-button md-type-black-secondary">Total purchases</h3>
				
				<ul className="md-type-subhead">
					<li>
						<span>${this.state.day.amount}</span>
						<span className="md-type-caption"> last 24 hours</span>
					</li>
					<li>
						<span>${this.state.week.amount}</span>
						<span className="md-type-caption"> last 7 days</span>
					</li>
					<li>
						<span>${this.state.month.amount}</span>
						<span className="md-type-caption"> last 30 days</span>
					</li>
				</ul>

				{buttons}
			</div>
		);
	}
}