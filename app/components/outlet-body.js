import React from 'react'
import PostCell from './post-cell'

export default class OutletBody extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			purchases: []
		}

		this.getPurchases = this.getPurchases.bind(this);
	}

	componentDidMount() {
		this.getPurchases();
	}

	componentDidUpdate(prevProps, prevState) {
		if(prevProps.activeTab != this.props.activeTab) {
			$('.tab').removeClass('toggled');
			$('.tab-' + this.props.activeTab.toLowerCase()).addClass('toggled');
		}
	}

	getPurchases() {
		$.get('/scripts/outlet/purchases?id=' + this.props.outlet._id + '&details=true', (purchases) => {
			if(purchases.err) return;

			this.setState({
				purchases: purchases.data.map((purchase) => {
					return purchase.post
				})
			})
		})
	}

	render() {

		var outlet = this.props.outlet;
		var posts = [];

		this.state.purchases.map((purchase, i) => {
			posts.push(<PostCell post={purchase} purchased="1" rank={this.props.user.rank} key={i} />);
			console.log(purchase);
		});

		return (
			<div className="container-fluid tabs">
				<div className="tab tab-vault toggled">
					<div className="container-fluid fat grid">
						<div className="profile visible-xs">
						</div>
						<div className="col-sm-4 profile hidden-xs">
							<div className="container-fluid fat">
								<div className="col-sm-12 col-md-9 col-sm-offset-1 col-md-offset-2">
									<img className="img-responsive" src={outlet.avatar || 'https://d1dw1p6sgigznj.cloudfront.net/images/user-1.png'} />
									<div className="meta">
										<div className="meta-list">
											<ul className="md-type-subhead">
												<li className="ellipses">
													<span className="mdi mdi-web icon"></span><a href={outlet.link}>{outlet.link}</a>
												</li>
											</ul>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="col-sm-8 tall">
							<div className="grid">
								<div className="row tiles" id="posts">
									{posts}
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="tab tab-purchases">
					<div className="container-fluid fat grid">
						<div id="purchase-list" className="col-md-8 col-xs-12 list"></div>
						<div className="col-md-4">
							<h3 className="md-type-button md-type-black-secondary">Total purchases</h3>
							<ul className="md-type-subhead">
								<li><span id="past-day"></span><span className="md-type-caption"> last 24 hours</span></li>
								<li><span id="past-week"></span><span className="md-type-caption"> last 7 days</span></li>
								<li><span id="past-month"></span><span className="md-type-caption"> last 30 days</span></li>
							</ul>
							<button id="email-statement-button" type="button" className="btn">Email my statement</button><span className="md-type-caption">Updated 9/1/2015</span>
						</div>
					</div>
				</div>
			</div>
		);
	}
}