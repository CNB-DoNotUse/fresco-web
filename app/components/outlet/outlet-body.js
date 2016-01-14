import React from 'react'
import moment from 'moment'
import PostCell from '../global/post-cell'
import PurchasesBody from '../purchases/purchases-body'
import PostList from '../global/post-list'

export default class OutletBody extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			posts: [],
			purchases: []
		}

		this.loadPosts = this.loadPosts.bind(this);
		this.loadPurchases = this.loadPurchases.bind(this);
		this.emailStatement = this.emailStatement.bind(this);
	}

	componentDidUpdate(prevProps, prevState) {
		if(prevProps.activeTab != this.props.activeTab) {
			$('.tab').removeClass('toggled');
			$('.tab-' + this.props.activeTab.toLowerCase()).addClass('toggled');
		}
	}

	loadPosts(passedOffset, cb) {
		this.loadPurchases(passedOffset, (purchases) => {
			
			var posts = purchases.map((purchase) => {
				return purchase.post;
			});

			cb(posts);

		});
	}

	/**
	 * Requests purchases from server
	 * @return {[type]} [description]
	 */
	loadPurchases(passedOffset, cb) {
		$.get('/scripts/outlet/purchases/list', {
			limit: 20,
			offset: passedOffset,
			details: true,
			id: this.props.outlet._id
		}, (response) => {

			if(response.err) {
				if(response.err != 'ERR_UNAUTHORIZED'){
					return $.snackbar({
						content: 'There was an error receiving your purchases'
					});
				}
				return cb([]);
			} 
			else if(!response.data){
				return cb([]);
			}

			var purchases = response.data.map((purchaseParent) => {
				var purchase = purchaseParent.purchase;
					purchase.title = purchaseParent.title;

				return purchase;
			});

			cb(purchases);

		});
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
				$.snackbar({content: 'Account statement successfully sent! Please check your email.'});
			},
			error: (xhr, status, error) => {
				$.snackbar({content: resolveError(error)});
			}
		});
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
								loadPosts={this.loadPosts}
								rank={this.props.user.rank}
								allPurchased={true}
								size='large'
								editable={false}
								scrollable={true} />
						</div>
					</div>
				</div>
				<div className="tab tab-purchases">
					<PurchasesBody
						purchases={this.state.purchases}
						emailStatement={this.emailStatement}
						loadPurchases={this.loadPurchases} />
				</div>
			</div>
		);
	}
}