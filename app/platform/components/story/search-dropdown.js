import React, { PropTypes } from 'react';
import AutocompleteMap from './../global/autocomplete-map';
import RadioGroup from './../global/radio-group';
import { GenericCheckbox, GenericRadio } from 'app/platform/components/global/checkbox';

class SearchDropdown extends React.Component {
    constructor(props) {
        super(props);

    }

    filterCheckboxes = () => {
        const { onChange,
            searchParams: {
                verified,
                unverified,
                seen,
                unseen,
                purchased,
                notPurchased,
                downloaded,
                notDownloaded
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
                    checked={seen}
                    text="Seen"
                    className=""
                    onChange={ () => onChange('seen') }/>
                <GenericCheckbox
                    checked={unseen}
                    text="Unseen"
                    className=""
                    onChange={ () => onChange('unseen') }/>
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
                <GenericCheckbox
                    checked={downloaded}
                    text="Downloaded"
                    className=""
                    onChange={ () => onChange('downloaded') }/>
                <GenericCheckbox
                    checked={notDownloaded}
                    text="Not downloaded"
                    className=""
                    onChange={ () => onChange('notDownloaded') }/>
            </div>
        );
    }

    sortByRadio = () => {
        return (
            <GenericRadio
                input1="Captured time"
                input2="Upload time"
                name="capture_time"
                onChange={ this.props.onChange('capturedTime', true) }/>
        );
    }

    displayRadio = () => {
        return (
            <GenericRadio
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

    render() {
        const {
            focus,
            onChange,
            searchParams
        } = this.props;
        return (
            <div className={ focus ? "normal" : "none" }>
                <section>
                    <p>Location</p>
                    <AutocompleteMap
                        address=""
                        onPlaceChange={ this.onMapChange }
                        onMapDataChange={ this.onMapChange }
                        location={searchParams.location}
                        address={searchParams.address}
                        draggable
                        hasRadius/>
                </section>
                <section>
                    <p>Search</p>
                    <p>Filters</p>
                    { this.filterCheckboxes() }
                    <p>Sort By</p>
                    { this.sortByRadio() }
                    <p>Display</p>
                    { this.displayRadio() }
                </section>
            </div>
        );
    }
}

export default SearchDropdown;
