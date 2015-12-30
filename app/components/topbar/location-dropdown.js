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

		this.setState({
			toggled: false
		});
	}

	//Called whenever the master button is clicked
	clicked(event) {
		if(this.state.toggled) return this.hideDropdown();

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
					<div className="toggle-drop toggler md-type-subhead" onClick={this.hideDropdown}>
						<span>Location</span>
						<span className="mdi mdi-menu-up icon pull-right"></span>
					</div>
					<div className="drop-body">
						<AutocompleteMap
							rerender={this.state.toggled}
							onMapDataChange={this.props.onMapDataChange}
							radius={this.props.radius}
							units="miles" />
					</div>
				</div>
			</div>
		);
	}
}

LocationDropdown.defaultProps = {
	onMapDataChange: function() {}
}