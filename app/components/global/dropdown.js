import React from 'react'

/**
 * Generic Dropdown Element
 * @param  {function} onSelected A function called wtih the user's selection
 */

export default class Dropdown extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			selected: this.props.selected
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
	}

	/**
	 * Called whenever the master button is clicked
	 */
	toggle() {
		var drop = this.refs.drop,
			menuIcon = this.refs['button'].refs['menu-icon'];
			
		if(drop.className.indexOf('active') == -1) {
			menuIcon.className = 'mdi mdi-menu-up';
			drop.className += ' active';
		} else{
			menuIcon.className = 'mdi mdi-menu-down';
			drop.className = drop.className.replace(/\bactive\b/,'');
		}

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
							selected={this.props.title || this.state.selected}>
							{this.props.dropdownActions}
						</DropdownButton>

						
		var className = this.props.inList ? 'nav-dropdown pull-right' : 'nav-dropdown';

		if(this.props.dropdownClass)
			className += ' ' + this.props.dropdownClass;

		return (
			<div className={className} ref="drop">
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
		return(
			<div className="toggle" onClick={this.props.toggle}>
				<span>{this.props.selected}</span>
				<span className="mdi mdi-menu-down" ref="menu-icon"></span>
				{this.props.children}
			</div>
		);
	}

}

Dropdown.defaultProps = {
	inList: false,
	onToggled: function() {}
}