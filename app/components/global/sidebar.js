import React from 'react'


/**
 * Side bar object found across the site; inside of the top level App class
 */
	
export default class Sidebar extends React.Component {

	constructor(props) {
		super(props);

		this.handleSearchKeyDown = this.handleSearchKeyDown.bind(this);

	}

	handleSearchKeyDown(e) {
		if(e.keyCode != 13) return;
		window.location ='/search?q=' + encodeURIComponent(this.refs.searchInput.value);
	}

	render() {

		var avatar = this.props.user.avatar || 'https://d1dw1p6sgigznj.cloudfront.net/images/user-1-small.png';
		
		return (
		
			<div className="col-lg-2 sidebar toggle-drawer">

				<div>
			
					<a href="/highlights">
						<img src="https://d1dw1p6sgigznj.cloudfront.net/images/wordmark-news.png" />
					</a>
				
					<div className="form-group-default">
						<input className="form-control" id="sidebar-search" placeholder="Search" type="text" ref="searchInput" onKeyDown={this.handleSearchKeyDown} />
					</div>
					
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

class SideBarListItems extends React.Component {

	constructor(props) {
		super(props);
		this.goLink = this.goLink.bind(this);
	}

	componentDidMount(prevProps, prevState) {
		var sidebarTabs = $('.sidebar-tab');

	 	sidebarTabs.each((i) => {
	 		var tab = $(sidebarTabs[i]);
	 		if(tab.attr('data-location') == window.location.pathname) {
	 			$(tab).addClass('active');
	 		}
	 	}); 
	}

	render() {

		if(!this.props.user) return;

		if (this.props.user.outlet || this.props.user.rank >= 1){ //CONTENT_MANAGER
			var dispatch = 
				<li className="sidebar-tab" onClick={this.goLink.bind(null, '/dispatch')} data-location="/dispatch">
					<span className="mdi mdi-map icon"></span>Dispatch
				</li>;
		}

		if (this.props.user.outlet != null){
		
			var outlet = 
				<li className="sidebar-tab" onClick={this.goLink.bind(null, '/outlet')} data-location="/outlet">
					<span className="mdi mdi-account-multiple icon"></span>{this.props.user.outlet.title}
				</li>;
		
		}
		if(this.props.user.rank >= 2) { 
			
			var admin = 
				<li className="sidebar-tab" onClick={this.goLink.bind(null, '/admin')} data-location="/admin">
					<span className="mdi mdi-dots-horizontal icon"></span>Admin
				</li>;
			
			var purchases =  
				<li className="sidebar-tab" onClick={this.goLink.bind(null, '/purchases')} data-location="/purchases">
					<span className="mdi mdi-currency-usd icon"></span>Purchases
				</li>;
		}

		return (
	
			<ul className="md-type-body1">
				<li className="sidebar-tab" onClick={this.goLink.bind(null, '/highlights')} data-location="/highlights">
					<span className="mdi mdi-star icon"></span>Highlights
				</li>
				<li className="sidebar-tab" onClick={this.goLink.bind(null, '/content')} data-location="/content">
					<span className="mdi mdi-play-box-outline icon"></span>All content
				</li>
				<ul>
					<li className="sidebar-tab" onClick={this.goLink.bind(null, '/content/photos')} data-location="/content/photos">
						<span className="mdi mdi-file-image-box icon"></span>Photos
					</li>
					<li className="sidebar-tab" onClick={this.goLink.bind(null, '/content/videos')} data-location="/content/videos">
						<span className="mdi mdi-movie icon"></span>Videos
					</li>
					<li className="sidebar-tab" onClick={this.goLink.bind(null, '/content/galleries')} data-location="/content/galleries">
						<span className="mdi mdi-image-filter icon"></span>Galleries
					</li>
					<li className="sidebar-tab" onClick={this.goLink.bind(null, '/content/stories')} data-location="/content/stories">
						<span className="mdi mdi-newspaper icon"></span>Stories
					</li>
				</ul>
				{dispatch}
				{outlet}
				{admin}	
				{purchases}
			</ul>
			
		)
	}

	goLink(link) {
		window.location.assign(link);
	}


}