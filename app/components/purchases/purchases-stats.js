import React from 'react'
import moment from 'moment'

export default class PurchasesStats extends React.Component {

	constructor(props) {
		super(props);
	}

	componentDidUpdate(prevProps, prevState) { // Got new purchases
		var pastDay = 0,
			pastWeek = 0,
			pastMonth = 0;

		this.props.purchases.map((purchase) => {
			var post = purchase.post,
				video = post.video != null,
				price = video ? 75 : 30,
				dayDiff = moment().diff(purchase.timestamp, 'days');

			if(dayDiff <= 1) {
				pastDay+= price;
			}

			if(dayDiff <= 7) {
				pastWeek += price;
			}

			if(dayDiff <= 30) {
				pastMonth += price;
			}
		});

		this.refs['purchases-past-day'].innerHTML = '$' + pastDay.toFixed(2);
		this.refs['purchases-past-week'].innerHTML = '$' + pastWeek.toFixed(2);
		this.refs['purchases-past-month'].innerHTML = '$' + pastMonth.toFixed(2);
	}

	render() {

		var buttons = [];

		if(this.props.xlsx){
			buttons.push(
				<button 
					id="export-xlsx"
					type="button" 
					className="btn" 
					onClick={this.props.downloadExports.bind(null, 'xlsx')}>Export to .xlsx</button>
			);
		};

		if(this.props.csv){
			buttons.push(
				<button 
					id="export-csv" 
					type="button" 
					className="btn" 
					onClick={this.props.downloadExports.bind(null, 'csv')}>Export to .csv</button>
			);
		}

		if(this.props.email){
			buttons.push(
				<button 
					id="email-statement-button" 
					type="button" 
					className="btn" 
					onClick={this.emailStatement}>Email my statement</button>
			)
		}

		return (
			<div className="col-md-4">
				<h3 className="md-type-button md-type-black-secondary">Total purchases</h3>
				<ul className="md-type-subhead">
					<li><span ref="purchases-past-day"></span><span className="md-type-caption"> last 24 hours</span></li>
					<li><span ref="purchases-past-week"></span><span className="md-type-caption"> last 7 days</span></li>
					<li><span ref="purchases-past-month"></span><span className="md-type-caption"> last 30 days</span></li>
				</ul>
				{buttons}
			</div>
		);
	}
}