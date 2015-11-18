var React = require('react'),
	ReactDOM = require('react-dom');

/**
 * Generic Dropdown Element
 * @param  {function} onSelected	A function called wtih the user's selection
 */
var Dropdown = React.createClass({

	displayName: 'Dropdown',

	getDefaultProps: function(){
		return {
			options: ['Relative', 'Absolute'],
		}
	},

	getInitialState: function(){
		return {
			selected: 'Relative',
		}
	},

	//CAlled whenever an option is selected from the dropdown
	clicked: function(event){
		var selected = event.currentTarget.innerHTML;

		//If the user chose the already selected option, don't do anything
		if (this.state.selected == selected) {
			this.hideDropdown();
			return;
		}

		this.setState({
			selected: selected
		});

		this.hideDropdown();

		if(this.props.onSelected) {
			this.props.onSelected(selected);
		}
	},

	//Hides the dropdown menu and removes the whole-screen dim
	hideDropdown: function(){
		this.refs.drop.classList.remove('toggled');
		var toRemoveToggle = document.getElementsByClassName('toggle-drop');
		for (var i = 0; i < toRemoveToggle.length; i++) {
			toRemoveToggle[i].classList.remove('toggled');
		}
	},

	render: function(){

		var options = this.props.options.map(function(option){
			var className = '';
			if(option === this.state.selected) { //Highlight the current selection
				className += ' active';
			}

			return ( <li className={className} key={option} onClick={this.clicked}>{option}</li> );
		}, this);

		return (
			<li className="drop pull-right hidden-xs">
			<button className="toggle-drop md-type-subhead" ref="toggle_button">
				<span>{this.state.selected}</span><span className="mdi mdi-menu-down icon"></span>
			</button>
			<div className="drop-menu panel panel-default" ref="drop">
				<div className="toggle-drop toggler md-type-subhead" onClick={this.hideDropdown}>
					<span>{this.state.selected}</span>
					<span className="mdi mdi-menu-up icon pull-right"></span>
				</div>
				<div className="drop-body">
					<ul className="md-type-subhead">
						{options}
					</ul>
				</div>
			</div>
			</li>
		);
	}
});

module.exports = Dropdown;
