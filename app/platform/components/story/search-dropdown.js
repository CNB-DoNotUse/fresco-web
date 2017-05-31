import React, { PropTypes } from 'react';
import AutocompleteMap from './../global/autocomplete-map';
import RadioGroup from './../global/radio-group';
import { GenericCheckbox, GenericRadio } from 'app/platform/components/global/checkbox';
import { setInLocalStorage, getFromLocalStorage } from 'app/lib/storage';



class SearchDropdown extends React.Component {
    constructor(props) {
        super(props);

    }

    componentDidUpdate(prevProps) {
        const { getUsers,
            getAssignments,
            getTags,
            searchParams: {
                searchTerm
            }
        } = this.props;
        if (prevProps.searchParams.searchTerm !== searchTerm && searchTerm !== "") {
            getUsers(searchTerm);
            getAssignments(searchTerm);
            // no API support for searching tags...yet
            // getTags(searchTerm);
        }

    }

    filterCheckboxes = () => {
        const { onChange,
            searchParams: {
                verified,
                unverified,
                purchased,
                notPurchased,
                downloaded,
                notDownloaded,
            }
        } = this.props;
        return (
            <div className="filters">
                <GenericCheckbox
                    checked={verified}
                    text="Verified"
                    className="verified"
                    onChange={ () => onChange('verified') }/>
                <GenericCheckbox
                    checked={unverified}
                    text="Unverified"
                    className=""
                    onChange={ () => onChange('unverified') }/>
                <GenericCheckbox
                    checked={purchased}
                    text="Purchased"
                    className=""
                    onChange={ () => onChange('purchased') }/>
                <GenericCheckbox
                    checked={notPurchased}
                    text="Not purchased"
                    className=""
                    onChange={ () => onChange('notPurchased') }/>
            </div>
        );
    }

    getChosenParams = () => {
        const { users, assignments } = this.props.searchParams.params;
    }

    sortByRadio = () => {
        return (
            <GenericRadio
                className="sortby-time"
                input1="Captured time"
                input2="Upload time"
                name="capture_time"
                onChange={ this.props.onChange('capturedTime', true) }/>
        );
    }

    displayRadio = () => {
        return (
            <GenericRadio
                className="display-time"
                input1="Relative time"
                input2="Absolute time"
                name="relative_time"
                onChange={ this.props.onChange('relativeTime', true) }/>
        );
    }

    onMapChange = (loc) => {
        this.props.onChange('address', true)(loc.address);
        this.props.onChange('location', true)(loc.location);
    }

    onSavePreference = () => {
        setInLocalStorage("searchParams", this.props.searchParams);
        // snackbar
    }

    onRadiusUpdate = (radius) => {
        this.props.onChange('radius', true)(radius);
    }

    render() {
        const {
            focus,
            onChange,
            searchParams,
            resetParams,
            usersAndAssignments,
        } = this.props;
        return (
            <div className={ focus ? "normal search-dropdown" : "none search-dropdown" }>
                <div className="search-dropdown--body">
                    <section className="search-dropdown--location">
                        <AutocompleteMap
                            onPlaceChange={ this.onMapChange }
                            onMapDataChange={ this.onMapChange }
                            location={searchParams.location}
                            address={searchParams.address}
                            radius={searchParams.radius}
                            onRadiusUpdate={ this.onRadiusUpdate }
                            draggable
                            hasRadius/>
                    </section>
                    <section className="search-dropdown--options">
                        <p>Search</p>
                        { usersAndAssignments }
                        <p>Filters</p>
                        { this.filterCheckboxes() }
                        <p>Sort By</p>
                        { this.sortByRadio() }
                        <p>Display</p>
                        { this.displayRadio() }
                    </section>
                </div>
                <div className="search-dropdown--buttons">
                    <div className="button" onClick={ resetParams }>Reset</div>
                    <div className="button" onClick={ this.onSavePreference }>Save</div>
                </div>
            </div>
        );
    }
}

export default SearchDropdown;
