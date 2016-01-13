import React from 'react'
import moment from 'moment'
import PostCell from '../global/post-cell'
import PostList from '../global/post-list'
import PurhcaseList from '../global/purchases-list'


export default class OutletBody extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			posts: [],
			purchases: []
		}

		this.getPurchases = this.getPurchases.bind(this);
		this.emailStatement = this.emailStatement.bind(this);
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
		$.get('/scripts/outlet/purchases?id=' + this.props.outlet._id + '&details=true', (response) => {
			
			if(response.err) return;

			var pastDay = 0,
				pastWeek = 0,
				pastMonth = 0,
				purchases = response.data;

			var posts = purchases.map((purchase) => {

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

				return purchase.post;

			});

			this.refs['purchases-past-day'].innerHTML = '$' + pastDay.toFixed(2);
			this.refs['purchases-past-week'].innerHTML = '$' + pastWeek.toFixed(2);
			this.refs['purchases-past-month'].innerHTML = '$' + pastMonth.toFixed(2);

			this.setState({
				posts: posts,
				purchases: purchases
			})
		})
	}

	emailStatement() {
		$.ajax({
			url: '/scripts/outlet/export/email',
			type: 'GET',
			dataType: 'json',
			success: (result, status, xhr) => {
				if (result.err) {
					return $.snackbar({content: resolveError(result.err)});
				}
				$.snackbar({content: 'Email Sent'});
			},
			error: (xhr, status, error) => {
				$.snackbar({content: resolveError(error)});
			}
		})
	}

	render() {

		var outlet = this.props.outlet,
			updatedText = moment().format('L');

		return (
			<div className="container-fluid tabs">
				<div className="tab tab-vault toggled">
					<div className="container-fluid fat grid">
						<div className="profile visible-xs"></div>
						
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
							<PostList
								rank={this.props.user.rank}
								posts={this.state.posts}
								allPurchased={true}
								scrollable={false}
								editable={false}
								size='large' />
						</div>
					</div>
				</div>
				<div className="tab tab-purchases">
					<div className="container-fluid fat grid">
						<PurhcaseList 
							purchases={this.state.purchases} />
						
						<div className="col-md-4">
							<h3 className="md-type-button md-type-black-secondary">Total purchases</h3>
							
							<ul className="md-type-subhead">
								<li><span ref="purchases-past-day"></span><span className="md-type-caption"> last 24 hours</span></li>
								<li><span ref="purchases-past-week"></span><span className="md-type-caption"> last 7 days</span></li>
								<li><span ref="purchases-past-month"></span><span className="md-type-caption"> last 30 days</span></li>
							</ul>
							
							<button 
								id="email-statement-button" 
								type="button" 
								className="btn" 
								onClick={this.emailStatement}>Email my statement</button>

								<span className="md-type-caption">Updated {updatedText}</span>
						</div>
					</div>
				</div>
			</div>
		);
	}
}