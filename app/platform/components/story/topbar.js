import React, { PropTypes } from 'react';
import utils from 'utils';
import time from 'app/lib/time';
import Dropdown from './../global/dropdown';
import RadioGroup from './../global/radio-group';
import LocationAutocomplete from './../global/location-autocomplete.js';
import SearchDropdown from './search-dropdown';

class StoriesTopBar extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            focus: false,

        }
    }

    onFocus = () => {
        const { focus } = this.state
        this.setState({ focus: !focus })
    }

    render() {
        const { focus } = this.state;
        const {
            onChange,
            searchParams
        } = this.props;
        return(
            <nav className="navbar stories navbar-fixed-top navbar-default">
                <h1 className="md-type-title">Stories</h1>
                <section className="stories-search">
                    {
                        focus ?
                        <section >
                            <span className="mdi mdi-magnify icon"></span>
                            <input
                                type="text"
                                value={ searchParams.searchTerm }
                                placeholder="Search for users, assignments, or tags"
                                onChange={(e) => onChange("searchTerm", true)(e.target.value)}></input>
                            <span className="mdi mdi-close icon" onClick={this.onFocus}></span>
                        </section>
                        : <span className="mdi mdi-magnify icon" onClick={this.onFocus}></span>
                    }
                    <SearchDropdown
                        focus={ focus }
                        searchParams={ searchParams }
                        onChange={ onChange } />
                </section>

            </nav>
        );
    }
}

export default StoriesTopBar;

//Notes
// onClick outside of input field should close the search dropdown
