import React from 'react'
import global from '../../../lib/global'

/**
 * Side bar object found across the site; inside of the top level App class
 */
	
export default class Sidebar extends React.Component {

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

		var avatar = this.props.user.avatar || 'https://d1dw1p6sgigznj.cloudfront.net/images/user-1-small.png';
		
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
			    	<img className="img-circle" id="side-bar-avatar" src={avatar} />
			      
					<a className="md-type-title user-name-view" href="/user">
						{this.props.user.firstname + ' ' + this.props.user.lastname}
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

	componentDidMount(prevProps, prevState) {
		var sidebarTabs = document.getElementsByClassName('sidebar-tab');

		//Set the current page's list item to the active state
		for (var i = 0; i < sidebarTabs.length; i++) {
			var tab = sidebarTabs[i],
				anchor = tab.getElementsByTagName('a')[0];

			if(anchor.pathname == window.location.pathname){
				tab.className += ' active';
			}
		}
	}

	render() {
		if(!this.props.user) return;

		if (this.props.user.outlet) {
			var dispatch = 
				<li className="sidebar-tab">
					<a href="/dispatch"><span className="mdi mdi-map icon"></span>Dispatch</a>
				</li>;
		}

		if (this.props.user.outlet != null){
			var outlet = 
				<li className="sidebar-tab">
					<a href="/outlet"><span className="mdi mdi-account-multiple icon"></span>{this.props.user.outlet.title}</a>
				</li>;
		}
		if(this.props.user.rank >= global.RANKS.CONTENT_MANAGER) { 
			var admin = 
				<li className="sidebar-tab">
					<a href="/admin"><span className="mdi mdi-dots-horizontal icon"></span>Admin</a>
				</li>;
		} 
		if(this.props.user.rank == global.RANKS.ADMIN) { 
			var purchases =  
				<li className="sidebar-tab">
					<a href="/purchases"><span className="mdi mdi-currency-usd icon"></span>Purchases</a>
				</li>;

			var stats = 
				<li className="sidebar-tab">
					<a href="/stats"><span className="mdi mdi-chart-line icon"></span>Stats</a>
				</li>;
		}

		return (
	
			<ul className="md-type-body1 master-list">
				<li className="sidebar-tab">
					<a href="/highlights"><span className="mdi mdi-star icon"></span>Highlights</a>
				</li>
				<li className="sidebar-tab">
					<a href="/archive"><span className="mdi mdi-play-box-outline icon"></span>Archive</a>
				</li>
				<ul>
					<li className="sidebar-tab">
						<a href="/archive/photos"><span className="mdi mdi-image icon"></span>Photos</a>
					</li>
					<li className="sidebar-tab">
						<a href="/archive/videos"><span className="mdi mdi-movie icon"></span>Videos</a>
					</li>
					<li className="sidebar-tab">
						<a href="/archive/galleries"><span className="mdi mdi-image-multiple icon"></span>Galleries</a>
					</li>
					<li className="sidebar-tab">
						<a href="/archive/stories"><span className="mdi mdi-newspaper icon"></span>Stories</a>
					</li>
				</ul>
				{dispatch}
				{outlet}
				{admin}	
				{purchases}
				{stats}
			</ul>
			
		)
	}

	goLink(link) {
		window.location.assign(link);
	}
}