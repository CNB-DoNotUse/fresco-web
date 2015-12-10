import React from 'react'
import AutocompleteMap from '../global/autocomplete-map'

export default class LocationDropdown extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			toggled: false
		}

		this.hideDropdown = this.hideDropdown.bind(this);
		this.clicked = this.clicked.bind(this);
	}

	//Hides the dropdown menu and removes the whole-screen dim
	hideDropdown() {
		
		this.refs.drop.classList.remove('toggled');
		
		var toRemoveToggle = document.getElementsByClassName('toggle-drop');
		
		for (var i = 0; i < toRemoveToggle.length; i++) {
			toRemoveToggle[i].classList.remove('toggled');
		}
	}

	//Called whenever the master button is clicked
	clicked(event) {
		var drop =  $(this.refs.toggle_button).siblings(".drop-menu");
			
		drop.toggleClass("toggled");
		
		if (drop.hasClass("toggled")) {

			this.setState({
				toggled: true
			});

			var offset = drop.offset().left;
			while (offset + drop.outerWidth() > $(window).width() - 7) {
				drop.css("left", parseInt(drop.css("left")) - 1 + "px");
				offset = drop.offset().left;
			}
		} else {

			this.setState({
				toggled: false
			});

		}
		
		$(".dim.toggle-drop").toggleClass("toggled");

	}

	render() {
		return(
			<div className="drop filter-location pull-right hidden-xs">
				<button className="toggle-drop md-type-subhead" ref="toggle_button" onClick={this.clicked}>
					<span>Location</span>
					<span className="mdi mdi-menu-down icon"></span>
				</button>
				<div className="drop-menu panel panel-default" ref="drop">
					<div className="toggle-drop toggler md-type-subhead">
						<span>Location</span>
						<span className="mdi mdi-menu-up icon pull-right"></span>
					</div>
					<div className="drop-body">
						<AutocompleteMap
							rerender={this.state.toggled}
							onPlaceChange={this.props.onPlaceChange}
							onRadiusChange={this.props.onRadiusChange}
							radius={250} />
					</div>
				</div>
			</div>
		);
	}
}

LocationDropdown.defaultProps = {
	onPlaceChange: function() {},
	onRadiusChange: function() {}
}