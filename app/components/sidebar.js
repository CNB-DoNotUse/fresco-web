var React = require('react'),
	ReactDOM = require('react-dom'),
	config = require('../../lib/config');

/**
 * Side bar object
 */

	
var Sidebar = React.createClass({

	displayName: 'Sidebar',

	render: function(){

		var avatar = this.props.user.avatar || 'https://d1dw1p6sgigznj.cloudfront.net/images/user-1-small.png';
		
		return (
		
			<div className="col-lg-2 sidebar toggle-drawer">

				<div>
			
					<a href="/highlights">
						<img src="https://d1dw1p6sgigznj.cloudfront.net/images/wordmark-news.png" />
					</a>
				
					<div className="form-group-default">
						<input className="form-control" id="sidebar-search" placeholder="Search" type="text" />
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

});


var SideBarListItems = React.createClass({

	render: function(){

		if(!this.props.user) return;

		if (this.props.user.outlet || this.props.user.rank >= config.RANKS.CONTENT_MANAGER){
			var dispatch = <li className="sidebar-tab" onClick={this.itemClicked} data-link="/dispatch">
								<span className="mdi mdi-map icon"></span>Dispatch
							</li>;
		}

		if (this.props.user.outlet != null){
		
			var outlet = <li className="sidebar-tab" onClick={this.itemClicked} data-link="/outlet">
							<span className="mdi mdi-account-multiple icon"></span>{this.props.user.outlet.title}
						</li>;
		
		}
		if(this.props.user.rank >= 2) { 
			
			var admin = <li className="sidebar-tab" onClick={this.itemClicked} data-link="/admin">
							<span className="mdi mdi-dots-horizontal icon"></span>Admin
						</li>;
			
			var purchases =  <li className="sidebar-tab" onClick={this.itemClicked} data-link="/purchases">
								<span className="mdi mdi-currency-usd icon"></span>Purchases
							</li>;
		}	
		return(
	
			<ul className="md-type-body1">
				<li className="sidebar-tab" onClick={this.itemClicked} data-link="/highlights">
					<span className="mdi mdi-star icon"></span>Highlights
				</li>
				<li className="sidebar-tab" onClick={this.itemClicked} data-link="/content">
					<span className="mdi mdi-play-box-outline icon"></span>All content
				</li>
				<ul>
					<li className="sidebar-tab" onClick={this.itemClicked} data-link="/content/photos">
						<span className="mdi mdi-file-image-box icon"></span>Photos
					</li>
					<li className="sidebar-tab" onClick={this.itemClicked} data-link="/content/videos">
						<span className="mdi mdi-movie icon"></span>Videos
					</li>
					<li className="sidebar-tab" onClick={this.itemClicked} data-link="/content/admin">
						<span className="mdi mdi-image-filter icon"></span>Galleries
					</li>
					<li className="sidebar-tab" onClick={this.itemClicked} data-link="/content/stories">
						<span className="mdi mdi-newspaper icon"></span>Stories
					</li>
				</ul>
				{dispatch}
				{outlet}
				{admin}	
				{purchases}
			</ul>
			
		)
	},
	itemClicked: function(event){

		console.log(event);

		// var link = event.currentTarget.data.link;

		// if(link && typeof window !== 'undefined')
		// 	window.location.assign(link);

	}

});

module.exports = Sidebar;