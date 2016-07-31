import React from 'react';
import utils from 'utils';
import Dropdown from './../global/dropdown';
import RadioGroup from './../global/radio-group';
import FrescoAutocomplete from './../global/fresco-autocomplete.js';

/**
 * Top Bar for pages of the site
 * @description The component takes optional toggles/pieces as props, and each prop is checked in the render.
 * If the prop exists, then the repsective toggle/dropdown/edit/whatever is added to the navigation bar
 */
class TopBar extends React.Component {

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
        // Update the position to the parent component
        this.props.updateMapPlace(autocompleteData.prediction);
    }

	/**
	 * Toggles the sidebar from hidden to showing
	 */
    toggleDrawer() {
        const sidebar = document.getElementById('_sidebar');
        const toggler = document.getElementById('_toggler');

        if (sidebar.className.indexOf('toggled') > -1) {
            // Remove toggled class
            $(sidebar).removeClass('toggled');
            $(toggler).removeClass('toggled');
        } else {
            // Add toggled class
            sidebar.className += ' toggled';
            toggler.className += ' toggled';
        }
    }

	// Called when has link prop.
    goLink() {
        window.location = this.props.link;
    }

    // Called when the user selects a time format
    timeToggleSelected(selected) {
        if (selected === 'Absolute time') {
            utils.setTimeDisplayType('absolute');
        } else if (selected === 'Relative time') {
            utils.setTimeDisplayType('relative');
        }
    }

    // Called when the user selects all content or verified
    verifiedToggleSelected(selected) {
        this.props.onVerifiedToggled(selected == 'Verified');
    }

	// Called when the user selects a time format
    chronToggleSelected(selected) {
        selected = selected.toLowerCase();

        if (selected === 'by capture time') {
            this.props.updateSort('captured_at');
        } else if (selected === 'by upload time') {
            this.props.updateSort('created_at');
        }
    }

    render() {
        let topbarItems = [];
        let locationInputCmp = '';
        let	saveButtonCmp = '';
        let	titleCmp = '';
        let tabCmps = '';
        const {
            title,
            saveButton,
            locationInput,
            mapPlace,
            editable,
            updateSettings,
            bounds,
            editIcon,
            edit,
            chronToggle,
            timeToggle,
            verifiedToggle,
            defaultVerified,
            rank,
            tabs,
            setActiveTab,
            activeTab,
        } = this.props;

        if (title){
            titleCmp = <h1 className="md-type-title">{title}</h1>;
        }

        if (saveButton){
            saveButtonCmp = (
                <a
                    onClick={updateSettings}
                    className="mdi mdi-content-save icon pull-right hidden-xs"
                >
                    <div className="ripple-wrapper"></div>
                </a>
            );
		}

		if (locationInput) {
			let text = '';

			if (mapPlace) {
				text = mapPlace.description || mapPlace.formatted_address;
			}

            locationInputCmp = (
                <FrescoAutocomplete
                    class="nav"
                    inputText={text}
                    bounds={bounds}
                    updateAutocompleteData={this.autocompleteUpdated}
                />
            );
		}

        if (editable) {
            let className = 'mdi icon pull-right hidden-xs toggle-edit toggler';

            if (editIcon) className += ' ' + editIcon;
            else className += ' mdi-pencil';

            topbarItems.push(
                <a className={className} key="edit" onClick={edit} />
            );
        }

		// If showing both the capture type and time type toggles, put the time
		// type toggle into the dropdown for capture time. Otherwise, display
		// it separately.
        if (chronToggle) {
            let timeToggleCmp;

            if (timeToggle) {
                timeToggleCmp = (
                    <RadioGroup
                        options={['Relative time', 'Absolute time']}
                        selected="Relative time"
                        onSelected={this.timeToggleSelected}
                        key="timeToggle"
                    />
                );
            }
            topbarItems.push(
                <Dropdown
                    options={['By capture time', 'By upload time']}
                    selected="By upload time"
                    onSelected={this.chronToggleSelected}
                    key="chronToggle"
                    inList
                >
                    {timeToggleCmp}
                </Dropdown>
            );
        } else if (timeToggle) {
            topbarItems.push(
                <Dropdown
                    options={['Relative time', 'Absolute time']}
                    selected="Relative time"
                    onSelected={this.timeToggleSelected}
                    key="timeToggle"
                    inList
                />
            );
        }

        if (verifiedToggle && rank > utils.RANKS.BASIC) {
            topbarItems.push(
                <Dropdown
                    options={['All content', 'Verified']}
                    selected={defaultVerified === 'all' ? 'All content' : 'Verified'}
                    onSelected={this.verifiedToggleSelected}
                    key="verifiedToggle"
                    inList
                />
            );
        }

        if (tabs) {
            const tabContent = [];

            tabs.map((tab) => {
                var buttonClass = "btn btn-flat vault " + tab.toLowerCase() + "-toggler" + (activeTab == tab ? ' toggled' : '');

                tabContent.push(
                    <button
                        className={buttonClass}
                        onClick={setActiveTab.bind(null, tab)}
                        key={tab.toLowerCase()}
                    >
                        {tab}
                        <div className="ripple-wrapper" />
                    </button>
                );
            });

            tabCmps = <div className="tab-control">{tabContent}</div>;
        }

        return (
            <nav className="navbar navbar-fixed-top navbar-default">
                <div 
                    className="dim toggle-drop toggler" 
                    id="_toggler" 
                    onClick={this.toggleDrawer} 
                />

                <button type="button" className="icon-button toggle-drawer toggler hidden-lg" onClick={this.toggleDrawer}>
                    <span className="mdi mdi-menu icon" />
                </button>

                <div className="spacer"></div>

                {title ? 
                    <h1 className="md-type-title">{title}</h1>
                    : ''}
                {locationInputCmp}
                {tabCmps}
                {topbarItems}
                {this.props.children}
                {saveButtonCmp}
            </nav>
        );
    }

}

TopBar.defaultProps = {
    title: '',
    edit() {},
    hide() { console.log('Hide function not implemented in TopBar'); },
    onVerifiedToggled() {},
    onOutletFilterAdd() {},
    onOutletFilterRemove() {},
};

export default TopBar;