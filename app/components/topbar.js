var React = require('react'),
	ReactDOM = require('react-dom'),
	Dropdown = require('./global/dropdown');

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
			topbarItems.push(
							<Dropdown
								options={['By capture time', 'By upload time']}
								selected='By capture time'
								onSelected={this.chronToggleSelected}
								key="chronToggle"
								inList={true} />
						);
		}
		if (this.props.timeToggle) {
			
			topbarItems.push(
			
				<Dropdown
					options={['Relative', 'Absolute']}
					selected='Absolute'
					onSelected={this.timeToggleSelected}
					key="timeToggle"
					inList={true} />
			);

		}
		if (this.props.verifiedToggle) {

			topbarItems.push(
				<Dropdown
					options={['All content', 'Verified']}
					selected='Verified'
					onSelected={this.verifiedToggleSelected}
					key="verifiedToggle"
					inList={true} />
			);

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

	//Called when the user selectes a time format
	verifiedToggleSelected: function(selected){
		
	},

	//Called when the user selectes a time format
	chronToggleSelected: function(selected){
		
	},

	toggleEdit: function(){

		$(".toggle-gedit").toggleClass("toggled");

	}

});


module.exports = TopBar;
