import React from 'react'
import global from './../../../lib/global'
import Dropdown from './../global/dropdown'
import RadioGroup from './../global/radio-group'
import FrescoAutocomplete from './../global/fresco-autocomplete.js'

/** //

Description : Top Bar for pages of the site
The component takes optional toggles/pieces as props, and each prop is checked in the render.
If the prop exists, then the repsective toggle/dropdown/edit/whatever is added to the navigation bar

// **/

export default class TopBar extends React.Component {

	constructor(props) {
		super(props);

		this.goLink = this.goLink.bind(this);
		this.toggleDrawer = this.toggleDrawer.bind(this);
		this.timeToggleSelected = this.timeToggleSelected.bind(this);
		this.verifiedToggleSelected = this.verifiedToggleSelected.bind(this);
		this.chronToggleSelected = this.chronToggleSelected.bind(this);
		this.autocompleteUpdated = this.autocompleteUpdated.bind(this);
	}

	/**
	 * Prop function called from `FrescoAutocomplete` for getting autocomplete date
	 */
	autocompleteUpdated(autocompleteData) {
		//Update the position to the parent component
		this.props.updateMapPlace(autocompleteData.prediction);
	}


	/**
	 * Toggles the sidebar from hidden to showing
	 */
	toggleDrawer() {
		var sidebar = document.getElementById('_sidebar'),
			toggler = document.getElementById('_toggler');

		if(sidebar.className.indexOf('toggled') > -1){
			//Remove toggled class
			$(sidebar).removeClass('toggled');
			$(toggler).removeClass('toggled');

		} else {
			//Add toggled class
			sidebar.className += ' toggled';
			toggler.className += ' toggled';
		}
	}

	// Called when has link prop.
	goLink() {
		window.location = this.props.link
	}

	//Called when the user selects a time format
	timeToggleSelected(selected) {
		if (selected == 'Absolute time') {
			global.setTimeDisplayType('absolute');
		}
		else if (selected == 'Relative time') {
			global.setTimeDisplayType('relative');
		}
	}

	//Called when the user selects a time format
	verifiedToggleSelected(selected) {
		this.props.onVerifiedToggled(selected == 'Verified');
	}

	//Called when the user selects a time format
	chronToggleSelected(selected) {
		selected = selected.toLowerCase();

		if (selected == 'by capture time') {
			this.props.updateSort('captured');
		}
		else if (selected == 'by upload time') {
			this.props.updateSort('upload');
		}
	}

	render() {

		var edit = '',
			topbarItems = [],
			locationInput = '',
			saveButton = '',
			title = '';

		if(this.props.title){
			title = <h1 className="md-type-title">{this.props.title}</h1>
		}

		if(this.props.saveButton){
			saveButton = <a
							onClick={this.props.updateSettings}
							className="mdi mdi-content-save icon pull-right hidden-xs">
							<div className="ripple-wrapper"></div>
						</a>;

		}

		if(this.props.locationInput) {
			locationInput = <div className="form-group-default pull-left location-input">
								<FrescoAutocomplete 
									type="small"
									updateAutocompleteData={this.autocompleteUpdated} />
							</div>

		}

		if (this.props.editable) {
			var className = "mdi icon pull-right hidden-xs toggle-edit toggler";

			if(this.props.editIcon)
				className += " " + this.props.editIcon;
			else
				className += " mdi-pencil";

			topbarItems.push(
				<a className={className}
					key="edit"
					onClick={this.props.edit}></a>
			);
		}

		// If showing both the capture type and time type toggles, put the time
		// type toggle into the dropdown for capture time. Otherwise, display
		// it separately.
		if (this.props.chronToggle) {
			let timeToggle = null;
			
			if (this.props.timeToggle) {
				timeToggle =
					<RadioGroup
						options={['Relative time', 'Absolute time']}
						selected='Relative time'
						onSelected={this.timeToggleSelected}
						name='timeToggle' />
			}
			topbarItems.push(
				<Dropdown
					options={['By capture time', 'By upload time']}
					selected='By upload time'
					onSelected={this.chronToggleSelected}
					key="chronToggle"
					inList={true}>
					{timeToggle}
				</Dropdown>
			);
		}

		if (this.props.verifiedToggle && this.props.rank > global.RANKS.BASIC) {
			topbarItems.push(
				<Dropdown
					options={['All content', 'Verified']}
					selected={this.props.defaultVerified == 'all' ? 'All content' : 'Verified'}
					onSelected={this.verifiedToggleSelected}
					key="verifiedToggle"
					inList={true} />
			);
		}

		if(this.props.tabs) {
			var tabContent = [];

			this.props.tabs.map((tab, i) => {

				var buttonClass = "btn btn-flat vault " + tab.toLowerCase() + "-toggler" + (this.props.activeTab == tab ? ' toggled' : '');

				tabContent.push(
					<button
						className={buttonClass}
						onClick={this.props.setActiveTab.bind(null, tab)}
						key={tab.toLowerCase()}>
						{tab}
						<div className="ripple-wrapper"></div>
					</button>
				)
			});

			var tabs = <div className="tab-control">
							{tabContent}
						</div>
		}

		return (
			<nav className="navbar navbar-fixed-top navbar-default">
				<div className="dim toggle-drop toggler" id="_toggler" onClick={this.toggleDrawer}></div>

				<button type="button" className="icon-button toggle-drawer toggler hidden-lg" onClick={this.toggleDrawer}>
					<span className="mdi mdi-menu icon"></span>
				</button>

				<div className="spacer"></div>

				{title}
				{locationInput}
				{tabs}
				{topbarItems}
				{this.props.children}
				{saveButton}
			</nav>
		);
	}

}

TopBar.defaultProps = {
	title: '',
	edit: function() {},
	hide: function () { console.log('Hide function not implemented in TopBar'); },
	onVerifiedToggled: function() {},
	onOutletFilterAdd: function() {},
	onOutletFilterRemove: function() {}
}
