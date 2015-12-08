import React from 'react'
import AutocompleteMap from '../global/autocomplete-map'

export default class LocationDropdown extends React.Component {
	constructor(props) {
		super(props);
		this.hideDropdown = this.hideDropdown();
		this.clicked = this.clicked();
	}

	hideDropdown() {

	}

	clicked() {

	}

	render() {
		return(
			<div className="split-cell drop">
				<button className="toggle-drop md-type-subhead" ref="toggle_button" onClick={this.clicked}>
					<span>Location</span>
					<span className="mdi mdi-menu-down icon"></span>
				</button>
				<div className="drop-menu panel panel-default" ref="drop" onClick={this.hideDropdown}>
					<div className="toggle-drop toggler md-type-subhead">
						<span>Location</span>
						<span className="mdi mdi-menu-up icon pull-right"></span>
					</div>
					<div className="drop-body">
						<AutocompleteMap />
					</div>
				</div>
			</div>
		);
	}
}