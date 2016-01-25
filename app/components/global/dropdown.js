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
			dim = document.getElementById('platform-dim');
			
		if(drop.className.indexOf('active') == -1) {
			drop.className += ' active';
			dim.className += ' toggled';
		} else{
			drop.className = drop.className.replace(/\bactive\b/,'');
			dim.className = dim.className.replace(/\btoggled\b/,'');
		}
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

		var options = this.props.options.map((option, i) => {
			
			var className = '';
			
			if(option === this.state.selected) { //Highlight the current selection if it's the selected one
				className += ' active';
			}

			return ( 
				<li className={className} key={i} onClick={this.optionClicked}>
					<span>{option}</span>
				</li> 
			);

		});

		var dropdownButton = <div className="toggle" ref="toggle_button" onClick={this.toggle}>
								<span>{this.state.selected}</span>
								<span className="mdi mdi-menu-down"></span>
							</div>

		var dropdownList = <ul className="list">
								{options}
							</ul>
					
		if(this.props.inList) {
			return (
				<div className="nav-dropdown pull-right" ref="drop">
					{dropdownButton}
					{dropdownList}
				</div>
			);
		}
		else {
			return (
				<div className="nav-dropdown" ref="drop">
					{dropdownButton}
					{dropdownList}
				</div>
			);
		}
	}
}

Dropdown.defaultProps = {
	options: ['Relative', 'Absolute'],
	inList: false
}