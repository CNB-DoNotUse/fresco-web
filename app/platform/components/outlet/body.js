import React from 'react'
import PurchasesBody from '../purchases/purchases-body'
import PostList from '../post/list'
import Sidebar from './sidebar'
import moment from 'moment'
import utils from 'utils'

export default class Body extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			posts: [],
			purchases: []
		}

		this.loadPosts = this.loadPosts.bind(this);
		this.loadPurchases = this.loadPurchases.bind(this);
		this.downloadExports = this.downloadExports.bind(this);
		this.loadStats = this.loadStats.bind(this);
		this.emailStatement = this.emailStatement.bind(this);
	}

	/**
	 * Loads posts using purchases data enpoint
	 */
	loadPosts(last, cb) {
		this.loadPurchases(last, (purchases) => {
			var posts = purchases.map((purchase) => {
				return purchase.post;
			});

			cb(posts);
		});
	}

	/**
	 * Loads stats for purchases
	 */
	loadStats(callback) {
		const params = {
			outlet_ids: [this.props.outlet.id]
		}

		$.ajax({
			url: '/api/purchase/stats',
			type: 'GET',
			data: $.param(params),
			success: (response, status, xhr) => {
				if(response.err || !response) {
					return $.snackbar({
						content: 'There was an error receiving purchases!'
					});
				} else {
					callback(response);
				}
			}
		});
	}

	/**
	 * Requests purchases from server
	 * @return {[type]} [description]
	 */
	loadPurchases(last = null, cb) {
		const params = {
			outlet_ids: [this.props.outlet.id],
			limit: 20,
			last
		}

		$.ajax({
			url: '/api/purchase/list',
			type: 'GET',
			data: $.param(params),
			success: (response, status, xhr) => {
				if(response.err || !response) {
					return $.snackbar({
						content: 'There was an error receiving purchases!'
					});
				} else {
					cb(response);
				}
			}
		});
	}

	downloadExports() {
		const oultets = `outlet_ids[]=${this.props.outlet.id}`;

		window.open(
			`/scripts/outlet/purchase/report?${oultets}`,
			'_blank'
		);
	}

	emailStatement() {
		$.ajax({
			url: '/api/outlet/emailStatement',
			type: 'GET',
			dataType: 'json',
			success: (response, status, xhr) => {
				if (response.err) {
					return $.snackbar({content: resolveError(response.err)});
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
        const { outlet, user, activeTab } = this.props;

		return (
			<div className="container-fluid tabs">
				<div className={`tab ${activeTab == 'Vault' ? 'toggled' : ''}`}>
					<div className="container-fluid fat">
						<div className="profile visible-xs"></div>

						<Sidebar outlet={outlet} />

						<div className="col-sm-8 tall">
							<PostList
								loadPosts={this.loadPosts}
								allPurchased={true}
								size='large'
								editable={false}
                                scrollable={true}
                                permissions={user.permissions}
                            />
						</div>
					</div>
				</div>
				<div className={`tab ${activeTab == 'Purchases' ? 'toggled' : ''}`}>
					<PurchasesBody
						emailStatement={this.emailStatement}
						downloadExports={this.downloadExports}
						loadPurchases={this.loadPurchases}
						loadStats={this.loadStats} />
				</div>
			</div>
		);
	}
}
