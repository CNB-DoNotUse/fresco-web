import React from 'react'

/**
 * Generic Dropdown Element
 * @param  {function} onSelected A function called wtih the user's selection
 */

export default class Dropdown extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			selected: this.props.selected,
			toggled: false
		}

		this.toggle = this.toggle.bind(this);
		this.optionClicked = this.optionClicked.bind(this);
	}

	componentDidUpdate(prevProps, prevState) {
		if(prevProps.selected != this.props.selected) {
			this.setState({
				selected: this.props.selected
			});
		}

		if(prevProps.toggled !== this.props.toggled) {
			this.toggle();
		}
	}

	/**
	 * Called whenever the master button is clicked
	 */
	toggle() {
		var drop = this.refs.drop,
			menuIcon = this.refs['button'].refs['menu-icon'];

		this.setState({
			toggled: !this.state.toggled
		});

		if(this.props.onToggled) this.props.onToggled();	
	}

	/**
	 * Called whenever an option is selected from the dropdown
	 */
	optionClicked(e) {
		//Get the span tag from the list item
		var selected = e.currentTarget.getElementsByTagName('span')[0].innerHTML;

		//If the user chose the already selected option, don't do anything
		if (this.state.selected == selected) {
			this.hideDropdown();
			return;
		}

		this.setState({
			selected: selected
		});

		this.toggle();

		if(this.props.onSelected) {
			this.props.onSelected(selected);
		}
	}

	render() {

		var list,
			body,
			dropdownButton;

		//If options are passed, use those
		if(this.props.options){
			var options = this.props.options.map((option, i) => {
				return ( 
					<li 
						className={option === this.state.selected ? 'active' : ''} 
						key={i} 
						onClick={this.optionClicked}>
						<span>{option}</span>
					</li> 
				);
			});

			list = <ul className="list">
						{options}
					</ul>
		}

		dropdownButton = <DropdownButton 
							ref="button"
							toggle={this.toggle}
							icon={this.props.icon}
							toggled={this.state.toggled}
							selected={this.props.title || this.state.selected}
							reverseCaretDirection={this.props.reverseCaretDirection}>
							{this.props.dropdownActions}
						</DropdownButton>

						
		var className = this.props.inList ? 'nav-dropdown pull-right' : 'nav-dropdown';

		if(this.props.dropdownClass)
			className += ' ' + this.props.dropdownClass;

		console.log(this.state.toggled);

		return (
			<div className={className + (this.state.toggled ? ' active' :'')} 
				ref="drop">
				{dropdownButton}
				
				<div className="dropdown-body">
					{list}
					{this.props.children}
				</div>
			</div>
		);
	}
}

class DropdownButton extends React.Component {

	constructor(props) {
		super(props)
	}

	render() {
		var buttonHeader = '',
			menuClass = '';

		if(this.props.toggled) {
			menuClass = 'mdi ';
			menuClass += this.props.reverseCaretDirection ? 'mdi-menu-down' : 'mdi-menu-up';
		} else {
			menuClass = 'mdi ';
			menuClass += this.props.reverseCaretDirection ? 'mdi-menu-up' : 'mdi-menu-down';
		}

		if(typeof(this.props.icon) !== 'undefined' && !this.props.toggled) {
			buttonHeader = [
				<span className={this.props.icon} ref="menu-icon"></span>
			];
		} else {
			buttonHeader = [
				<span>{this.props.selected}</span>,
				
				<span className={menuClass} ref="menu-icon"></span>
			];
		}

		return(
			<div className="toggle" onClick={this.props.toggle}>
				{buttonHeader}
				
				{this.props.children}
			</div>
		);
	}

}

Dropdown.defaultProps = {
	reverseCaretDirection: false,
	inList: false,
	onToggled: function() {}
}