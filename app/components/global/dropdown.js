var React = require('react'),
	ReactDOM = require('react-dom');

/**
 * Generic Dropdown Element
 * @param  {function} onSelected A function called wtih the user's selection
 */

var Dropdown = React.createClass({

	displayName: 'Dropdown',

	getDefaultProps: function(){
		return {
			options: ['Relative', 'Absolute'],
			inList: false
		}
	},

	getInitialState: function(){
		return {
			selected: this.props.selected
		}
	},

	//Called whenever the master button is clicked
	clicked: function(event){

		var drop =  $(this.refs.toggle_button).siblings(".drop-menu");
			
		drop.toggleClass("toggled");
		
		if (drop.hasClass("toggled")) {
			var offset = drop.offset().left;
			while (offset + drop.outerWidth() > $(window).width() - 7) {
				drop.css("left", parseInt(drop.css("left")) - 1 + "px");
				offset = drop.offset().left;
			}
		}
		
		$(".dim.toggle-drop").toggleClass("toggled");

	},

	//Called whenever an option is selected from the dropdown
	optionClicked: function(event){

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

			return ( 
				<li className={className} key={option} onClick={this.optionClicked}>{option}</li> 
			);

		}, this);

		var dropdownButton = <button className="toggle-drop md-type-subhead" ref="toggle_button" onClick={this.clicked}>
								<span>{this.state.selected}</span>
								<span className="mdi mdi-menu-down icon"></span>
							</button>

		var dropdownList = <div className="drop-menu panel panel-default" ref="drop" onClick={this.hideDropdown}>
								<div className="toggle-drop toggler md-type-subhead">
									<span>{this.state.selected}</span>
									<span className="mdi mdi-menu-up icon pull-right"></span>
								</div>
								<div className="drop-body">
									<ul className="md-type-subhead">
										{options}
									</ul>
								</div>
							</div>;
					

		if(this.props.inList){
			return(
				<li className="drop pull-right hidden-xs">
					{dropdownButton}
					{dropdownList}
				</li>
			);
		}
		else{
			return(
				<div className="split-cell drop">
					{dropdownButton}
					{dropdownList}
				</div>
			);
		}
	}
});

module.exports = Dropdown;
