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

	componentDidMount() {
	 	//Click event for outside clicking
	 	$(document).click((e) => {
	 		//Check that the click is out of bounds
	 	    if ($(e.target).parents('.nav-dropdown').size() == 0 && e.target !== this.refs.drop) {
	 	    	//Check if it's active first
	 	    	if(this.refs.drop.className.indexOf('active') > 0){
		 	        //Reset toggle
		 	        this.toggle();
		 	    }
	 	    }
	 	});
	}

	componentWillUnmount() {
	    //Clean up click event on unmount
	    $(document).unbind('click');
	}

	componentWillReceiveProps(nextProps) {
		if(nextProps.selected !== this.props.selected) {
			this.setState({
				selected: nextProps.selected
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
			menuIcon.className = 'mdi ';
			menuIcon.className += this.props.reverseCaretDirection ? 'mdi-menu-down' : 'mdi-menu-up';
			drop.className += ' active';
		} else {
			menuIcon.className = 'mdi ';
			menuIcon.className += this.props.reverseCaretDirection ? 'mdi-menu-up' : 'mdi-menu-down';
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
			this.toggle();
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

		var list = '',
			dropdownButton = '';

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
							selected={this.props.title || this.state.selected}
							reverseCaretDirection={this.props.reverseCaretDirection}>
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
				<span className={"mdi " + (this.props.reverseCaretDirection ? "mdi-menu-up" : "mdi-menu-down")} ref="menu-icon"></span>
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
