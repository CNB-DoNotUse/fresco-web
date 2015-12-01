import React from 'react'
import Dropdown from './global/dropdown'

/** //

Description : Top for pages of the site

// **/

export default class TopBar extends React.Component {

	constructor(props) {
		super(props);
		this.timeToggleSelected = this.timeToggleSelected.bind(this);
		this.verifiedToggleSelected = this.verifiedToggleSelected.bind(this);
		this.chronToggleSelected = this.chronToggleSelected.bind(this);
		this.toggleEdit = this.toggleEdit.bind(this);
		this.outletsFilterSelected = this.outletsFilterSelected.bind(this);
	}

	//Called when the user selects a time format
	timeToggleSelected(selected) {
		if (selected == 'Absolute') {
			setTimeDisplayType('absolute');
		}
		else if (selected == 'Relative') {
			setTimeDisplayType('relative');
		}
	}

	//Called when the user selects a time format
	verifiedToggleSelected(selected) {
		
	}

	//Called when the user selects a time format
	chronToggleSelected(selected) {
		
	}

	toggleEdit() {

		$(".toggle-edit").toggleClass("toggled");

	}
	// Called when user selects an outlet to filter
	outletsFilterSelected() {

	}

	render() {

		var edit = '';

		var topbarItems = [];
		
		if (this.props.editable) {
			topbarItems.push(
				<a className="mdi mdi-pencil icon pull-right hidden-xs toggle-edit toggler"
					key="edit"
					onClick={this.toggleEdit}></a>
			);
		}
		if (this.props.chronToggle) {
			topbarItems.push(
							<Dropdown
								options={['By capture time', 'By upload time']}
								selected='By capture time'
								onSelected={this.chronToggleSelected}
								key="chronToggle"
								inList={true} />
						);
		}
		if (this.props.timeToggle) {
			
			topbarItems.push(
			
				<Dropdown
					options={['Relative', 'Absolute']}
					selected='Absolute'
					onSelected={this.timeToggleSelected}
					key="timeToggle"
					inList={true} />
			);

		}
		if (this.props.verifiedToggle) {

			topbarItems.push(
				<Dropdown
					options={['All content', 'Verified']}
					selected='Verified'
					onSelected={this.verifiedToggleSelected}
					key="verifiedToggle"
					inList={true} />
			);

		}

		if (this.props.outletsFilter) {
			topbarItems.push(
				<Dropdown
					options={['A', 'B', 'C']}
					selected="A"
					onSelected={this.outletsFilterSelected}
					key="outletsFilter"
					inList={true} />
			)
		}

		if(this.props.tabs) {
			var tabContent = [];
			this.props.tabs.map((tab, i) => {
				tabContent.push(
					<button
						className={"btn btn-flat vault " + tab.toLowerCase() + "-toggler" + (this.props.activeTab == tab ? ' toggled' : '')}
						onClick={this.props.setActiveTab.bind(null, tab)}
						key={tab.toLowerCase()}>
						{tab}
						<div className="ripple-wrapper"></div>
					</button>
				)
			})
			var tabs = <div className="tab-control">{tabContent}</div>
		}

		return (
			<nav className="navbar navbar-fixed-top navbar-default">
				<div className="dim transparent toggle-drop toggler"></div>
				<button type="button" className="icon-button toggle-drawer toggler hidden-lg">
					<span className="mdi mdi-menu icon"></span>
				</button>
				<div className="spacer"></div>
				<h1 className="md-type-title">{this.props.title}</h1>
				{tabs}
				{topbarItems}
			</nav>
		);
	}

}

TopBar.defaultProps = {
	title: ''
}
