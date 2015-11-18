var React = require('react');
var ReactDOM = require('react-dom');
var Dropdown = require('./Dropdown')

/** //

Description : Top for pages of the site

// **/

var TopBar = React.createClass({

	displayName: 'TopBar',

	getDefaultProps: function() {
		return {
			title: ''
		};
	},

	render: function(){

		var edit = '';

		var topbarItems = [];
		if (this.props.editable) {
			topbarItems.push(
				<a className="mdi mdi-pencil icon pull-right hidden-xs toggle-gedit toggler"
					key="edit"
					onClick={this.toggleEdit}></a>
			);
		}
		if (this.props.chronToggle) {
			topbarItems.push(<ChronToggle key="chronToggle" />);
		}
		if (this.props.timeToggle) {
			topbarItems.push(
				<Dropdown
					options={['Relative', 'Absolute']}
					selected='Absolute'
					onSelected={this.timeToggleSelected}
					key="timeToggle" />
			)
		}
		if (this.props.verifiedToggle) {
			topbarItems.push(<VerifiedToggle key="verifiedToggle" />);
		}

		return (
			<nav className="navbar navbar-fixed-top navbar-default">
				<div className="dim transparent toggle-drop toggler"></div>
				<button type="button" className="icon-button toggle-drawer toggler hidden-lg">
					<span className="mdi mdi-menu icon"></span>
				</button>
				<div className="spacer"></div>
				<h1 className="md-type-title">{this.props.title}</h1>
				{topbarItems}

			</nav>
		);
	},

	//Called when the user selectes a time format
	timeToggleSelected: function(selected){
		if (selected == 'Absolute') {
			setTimeDisplayType('absolute');
		}
		else if (selected == 'Relative') {
			setTimeDisplayType('relative');
		}
	},

	toggleEdit: function(){

		$(".toggle-gedit").toggleClass("toggled");


	}

});

var VerifiedToggle = React.createClass({

	displayName: 'VerifiedToggle',

	render: function(){

		return (

			//Check if content manger or creater (config.RANKS.CONTENT_MANAGER)
			<li className="drop pull-right hidden-xs">
				<button className="toggle-drop md-type-subhead filter-button">
					<span className="filter-text">Verified content</span>
					<span className="mdi mdi-menu-down icon"></span>
				</button>
				<div className="drop-menu panel panel-default">
					<div className="toggle-drop toggler md-type-subhead">
						<span className="filter-text">Verified content</span>
						<span className="mdi mdi-menu-up icon pull-right"></span>
					</div>
					<div className="drop-body">
						<ul className="md-type-subhead">
							<li className="filter-type">All content</li>
							<li className="filter-type active">Verified content</li>
						</ul>
					</div>
				</div>
			</li>

		)

	},
	clicked: function(){


	}

});

var ChronToggle = React.createClass({

	displayName: 'ChronToggle',

	render: function(){

		return (

			//Check if content manger or creater (config.RANKS.CONTENT_MANAGER)
			<li className="drop pull-right hidden-xs">
				<button className="toggle-drop md-type-subhead filter-button">
					<span className="filter-text">By capture time</span>
					<span className="mdi mdi-menu-down icon"></span>
				</button>
				<div className="drop-menu panel panel-default">
					<div className="toggle-drop toggler md-type-subhead">
						<span className="filter-text">By capture time</span>
						<span className="mdi mdi-menu-up icon pull-right"></span>
					</div>
					<div className="drop-body">
						<ul className="md-type-subhead">
							<li className="filter-type">By capture time</li>
							<li className="filter-type active">By upload time</li>
						</ul>
					</div>
				</div>
			</li>

		)

	},
	clicked: function(){


	}

});


module.exports = TopBar;
