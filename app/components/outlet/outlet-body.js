import React from 'react'
import PurchasesSummary from '../purchases/purchases-summary'
import PostList from '../global/post-list'
import OutletSidebar from './outlet-sidebar'
import moment from 'moment'
import global from '../../../lib/global'

export default class OutletBody extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			posts: [],
			purchases: []
		}

		this.loadPosts = this.loadPosts.bind(this);
		this.loadPurchases = this.loadPurchases.bind(this);
		this.loadStats = this.loadStats.bind(this);
		this.emailStatement = this.emailStatement.bind(this);
	}

	/**
	 * Loads posts using purchases data enpoint
	 */
	loadPosts(passedOffset, cb) {
		this.loadPurchases(passedOffset, (purchases) => {
			var posts = purchases.map((purchase) => {
				return purchase.post;
			});

			cb(posts);
		});
	}

	/**
	 * Loads stats for outlet
	 */
	loadStats(callback) {
		$.get('/api/outlet/purchases/stats', {
			outlets: [ this.props.outlet._id ]
		}, (response) => {
			if(response.err || !response.data) {
				return $.snackbar({
					content: 'There was an error receiving the purchases'
				});
			}

			callback(response.data);
		});
	}

	/**
	 * Requests purchases from server
	 */
	loadPurchases(passedOffset, cb) {
		$.get('/api/outlet/purchases', {
			limit: 20,
			offset: passedOffset,
			sort: true,
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
				if(!purchaseParent.purchase) return purchaseParent;
				
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
				} else {
					return $.snackbar({content: 'Account statement successfully sent! Please check your email.'});
				}
			},
			error: (xhr, status, error) => {
				$.snackbar({content: resolveError(error)});
			}
		});
	}

	render() {
		var outlet = this.props.outlet,
			vaultClass = this.props.activeTab == 'Vault' ? 'tab tab-vault toggled' : 'tab tab-vault',
			purchasesClass = this.props.activeTab == 'Purchases' ? 'tab tab-purchases toggled' : 'tab tab-purchases';

		return (
			<div className="container-fluid tabs">
				<div className={vaultClass}>
					<div className="container-fluid fat">
						<div className="profile visible-xs"></div>
						
						<OutletSidebar outlet={outlet} />
						
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

				<div className={purchasesClass}>
					<PurchasesSummary
						purchases={this.state.purchases}
						emailStatement={this.emailStatement}
						loadPurchases={this.loadPurchases}
						loadStats={this.loadStats} />
				</div>
			</div>
		);
	}
}