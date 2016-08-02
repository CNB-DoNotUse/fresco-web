import React, { PropTypes } from 'react';
import utils from 'utils';
import Dropdown from './../global/dropdown';
import RadioGroup from './../global/radio-group';
import FrescoAutocomplete from './../global/fresco-autocomplete.js';

/**
 * Top Bar for pages of the site
 * @description The component takes optional toggles/pieces as props,
 * and each prop is checked in the render.
 * If the prop exists, then the repsective toggle/dropdown/edit/whatever
 * is added to the navigation bar
 */
class Index extends React.Component {
    
	/**
	 * Prop function called from `FrescoAutocomplete` for getting autocomplete date
	 */
    onUpdateAutocomplete(data) {
        // Update the position to the parent component
        this.props.updateMapPlace(data.prediction);
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

    renderTopBarItems() {
        const {
            editable,
            editIcon,
            edit,
            chronToggle,
            timeToggle,
            verifiedToggle,
            defaultVerified,
            rank,
        } = this.props;
        const topbarItems = [];

        if (editable) {
            let className = `mdi icon pull-right hidden-xs toggle-edit
            ${editIcon || 'mdi-pencil'} toggler`;

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
                        onSelected={(s) => this.timeToggleSelected(s)}
                        key="timeToggle"
                    />
                );
            }
            topbarItems.push(
                <Dropdown
                    options={['By capture time', 'By upload time']}
                    selected="By upload time"
                    onSelected={(s) => this.chronToggleSelected(s)}
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
                    onSelected={(s) => this.timeToggleSelected(s)}
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
                    onSelected={(s) => this.verifiedToggleSelected(s)}
                    key="verifiedToggle"
                    inList
                />
            );
        }

        return topbarItems;
    }

    renderTabs() {
        const {
            tabs,
            setActiveTab,
            activeTab,
        } = this.props;

        if (tabs) {
            const tabContent = tabs.map((tab) => (
                <button
                    className={`btn btn-flat vault ${tab.toLowerCase()}-toggler
                            ${activeTab === tab ? 'toggled' : ''}`}
                    onClick={() => setActiveTab(tab)}
                    key={tab.toLowerCase()}
                >
                    {tab}
                    <div className="ripple-wrapper" />
                </button>
            ));

            return <div className="tab-control">{tabContent}</div>;
        }

        return '';
    }

    render() {
        const {
            title,
            saveButton,
            locationInput,
            mapPlace,
            updateSettings,
            bounds,
            children,
        } = this.props;

        return (
            <nav className="navbar navbar-fixed-top navbar-default">
                <div
                    className="dim toggle-drop toggler"
                    id="_toggler"
                    onClick={() => this.toggleDrawer()}
                />

                <button
                    type="button"
                    className="icon-button toggle-drawer toggler hidden-lg"
                    onClick={() => this.toggleDrawer()}
                >
                    <span className="mdi mdi-menu icon" />
                </button>

                <div className="spacer" />

                {title
                    ? <h1 className="md-type-title">{title}</h1>
                    : ''
                }
                {locationInput
                    ? <FrescoAutocomplete
                        class="nav"
                        inputText={mapPlace ? mapPlace.description || mapPlace.formatted_address : ''}
                        bounds={bounds}
                        updateAutocompleteData={(a) => this.onUpdateAutocomplete(a)}
                    />
                    : ''
                }
                {this.renderTabs()}
                {this.renderTopBarItems()}
                {children}
                {saveButton
                    ? <a
                        onClick={updateSettings}
                        className="mdi mdi-content-save icon pull-right hidden-xs"
                    >
                        <div className="ripple-wrapper"></div>
                    </a>
                    : ''
                }

            </nav>
        );
    }

}

Index.propTypes = {
    title: PropTypes.string,
    saveButton: PropTypes.bool,
    locationInput: PropTypes.bool,
    mapPlace: PropTypes.object,
    editable: PropTypes.bool,
    updateSettings: PropTypes.func,
    bounds: PropTypes.object,
    editIcon: PropTypes.string,
    edit: PropTypes.func,
    chronToggle: PropTypes.bool,
    timeToggle: PropTypes.bool,
    verifiedToggle: PropTypes.bool,
    defaultVerified: PropTypes.string,
    rank: PropTypes.number,
    tabs: PropTypes.array,
    setActiveTab: PropTypes.func,
    activeTab: PropTypes.string,
    children: PropTypes.node,
    updateMapPlace: PropTypes.func,
    onVerifiedToggled: PropTypes.func,
};

Index.defaultProps = {
    title: '',
    edit() {},
    hide() { console.log('Hide function not implemented in TopBar'); },
    onVerifiedToggled() {},
    onOutletFilterAdd() {},
    onOutletFilterRemove() {},
};

export default Index;

