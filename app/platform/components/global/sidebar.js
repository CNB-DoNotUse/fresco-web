import React, { Component } from 'react'
import utils from 'utils'

/**
 * Side bar object found across the site; inside of the top level App class
 */
export default class Sidebar extends Component {

	constructor(props) {
		super(props);

		this.handleSearchKeyDown = this.handleSearchKeyDown.bind(this);
	}

	handleSearchKeyDown(e) {
		var input = this.refs.searchInput;

		if(e.keyCode != 13 || input.value === '')
			return;

		window.location ='/search?q=' + encodeURIComponent(this.refs.searchInput.value);
	}

	render() {
		return (
			<div className="col-lg-2 sidebar toggle-drawer" id="_sidebar">
				<div>
					<a href="/highlights">
						<img src="https://d1dw1p6sgigznj.cloudfront.net/images/wordmark-news.png" />
					</a>

					<input
						className="search-input"
						id="sidebar-search"
						placeholder="Search"
						type="text"
						ref="searchInput"
						defaultValue={this.props.query}
						onKeyDown={this.handleSearchKeyDown} />

					<SideBarListItems user={this.props.user} />
				</div>
		   	 	<div>
			    	<img 
			    		className="img-circle" 
			    		id="side-bar-avatar" 
			    		src={this.props.user.avatar || utils.defaultSmallAvatar} />

					<a className="md-type-title user-name-view" href="/user">
						{this.props.user.full_name || this.props.user.username}
					</a>

			    	<ul>
						<li><a href="/user/settings">Settings</a></li>
				        <li><a href="/scripts/user/logout">Log out</a></li>
			     	</ul>
		    	</div>
			</div>
		)
	}
}

Sidebar.defaultProps = {
	query: ''
}

class SideBarListItems extends React.Component {

	constructor(props) {
		super(props);
		this.goLink = this.goLink.bind(this);
	}

	render() {
		if(!this.props.user) return;

		const { user } = this.props;
		
		let dispatch = null;
		let outlet = null;
		let admin = null;
		let purchases = null;
		let stats = null;

		if (user.outlet) {
			dispatch =
				<SidebarItem
					link='/dispatch'
					icon='mdi-map'
					text='Dispatch'
				/>;
		}

		if (user.outlet != null){
			outlet =
				<SidebarItem
					link='/outlet'
					icon='mdi-account-multiple'
					text={user.outlet.title}
				/>;
		}
		if(user.permissions.includes('update-other-content')) {
			admin =
				<SidebarItem
					link='/admin'
					icon='mdi-dots-horizontal'
					text='Admin'
				/>;
		}
		if(user.permissions.includes('get-all-purchases')) {
			purchases =
				<SidebarItem
					link='/purchases'
					icon='mdi-currency-usd'
					text='Purchases'
				/>;

			stats =
				<SidebarItem
					link='/stats'
					icon='mdi-chart-line'
					text='Stats'
				/>;
		}

		return (
			<ul className="md-type-body1 master-list">
				<SidebarItem
					link='/highlights'
					icon='mdi-star'
					text='Highlights'
				/>

				<SidebarItem
					link='/archive'
					icon='mdi-play-box-outline'
					text='Archive'
				/>
				<ul>
					<SidebarItem
						link='/archive/photos'
						icon='mdi-image'
						text='Photos'
					/>

					<SidebarItem
						link='/archive/videos'
						icon='mdi-image'
						text='Videos'
					/>

					<SidebarItem
						link='/archive/galleries'
						icon='mdi-image'
						text='Galleries'
					/>

					<SidebarItem
						link='/archive/stories'
						icon='mdi-newspaper'
						text='Stories'
					/>
				</ul>
				{dispatch}

				{outlet}

				{admin}

				{purchases}

				{stats}
			</ul>
		);
	}

	goLink(link) {
		window.location.assign(link);
	}
}

class SidebarItem extends React.Component {
	render() {
		const {link, icon, text} = this.props;
		const active = window.location.pathname === link;
		const className = `sidebar-tab ${active ? 'active' : ''}`

		return (
			<li className={className}>
				<a href={link}>
					<span className={'mdi ' + icon + ' icon'}></span>
					<span>{text}</span>
				</a>
			</li>
		);
	}
}

SidebarItem.defaultProps = {
	link: '',
	icon: '',
	text: ''
}