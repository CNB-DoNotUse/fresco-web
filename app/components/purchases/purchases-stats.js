import React from 'react'
import moment from 'moment'

export default class PurchasesStats extends React.Component {

	constructor(props) {
		super(props);

		this.downloadExports = this.downloadExports.bind(this);
	}

	downloadExports(format) {
		var url = "/scripts/outlet/export?format=" + format;
		
		window.open(url, '_self');
	}

	componentDidUpdate(prevProps, prevState) { // Got new purchases
		var pastDay = 0,
			pastWeek = 0,
			pastMonth = 0;

		this.props.purchases.map((item) => {
			var purchase = item.purchase;
			var post = purchase.post;
			var video = post.video != null;
			var price = video ? 75 : 30;
			var dayDiff = moment().diff(purchase.timestamp, 'days');

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
		return (
			<div className="col-md-4">
				<h3 className="md-type-button md-type-black-secondary">Total purchases</h3>
				<ul className="md-type-subhead">
					<li><span ref="purchases-past-day"></span><span className="md-type-caption"> last 24 hours</span></li>
					<li><span ref="purchases-past-week"></span><span className="md-type-caption"> last 7 days</span></li>
					<li><span ref="purchases-past-month"></span><span className="md-type-caption"> last 30 days</span></li>
				</ul>
				<button id="export-xlsx" type="button" className="btn" onClick={this.downloadExports.bind(null, 'xlsx')}>Export to .xlsx</button>
				<button id="export-csv" type="button" className="btn" onClick={this.downloadExports.bind(null, 'csv')}>Export to .csv</button>
			</div>
		);
	}
}