import React, { PropTypes } from 'react';
import utils from 'utils';
import time from 'app/lib/time';
import Dropdown from './../global/dropdown';
import RadioGroup from './../global/radio-group';
import LocationAutocomplete from './../global/location-autocomplete.js';
import SearchDropdown from './search-dropdown';
import AutocompleteDropdown from './autocomplete-dropdown';
import { UserChip } from 'app/platform/components/global/user-item';

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
        this.props.onChange("searchTerm", true)("");
    }

    packAutocompleteUsers = () => {
        const { searchParams: { users },
            moveUser
        } = this.props;
        const usersThree = [];
        for (let userID in users) {
            if (usersThree.length < 5) {
                usersThree.push(
                    <UserChip
                        user={users[userID]}
                        clickFunc={moveUser}
                        key={userID}
                        />
                );
            }
        }
        return usersThree;
    }

    packAutocompleteAssignments = () => {
        const { searchParams: { assignments },
            moveAssignment
        } = this.props;
        const assignmentsThree = [];
        for (let assignmentID in assignments) {
            if (assignmentsThree.length < 5) {
                assignmentsThree.push(
                    <li onClick={() => moveAssignment(assignmentID)}
                        key={assignmentID}>
                    { assignments[assignmentID].title }
                    </li>
                );
            }
        }
        return assignmentsThree;
    }

    packSearchUsersAndAssignments = () => {
        const {
            searchParams: { params: { users, assignments } },
            moveUser,
            moveAssignment
        } = this.props;
        const usersAndAssignments = [];
        if (Object.keys(users) > 0) {
            for (let userID in users) {
                usersAndAssignments.push(
                    <UserChip
                        user={users[userID]}
                        clickFunc={moveUser}
                        key={userID}
                        />
                )
            }
        }
        if (Object.keys(assignments) > 0) {
            for (let assignmentID in assignments) {
                usersAndAssignments.push(
                    <li onClick={() => moveAssignment(assignmentID)}
                        key={assignmentID}>
                    { assignments[assignmentID].title }
                    </li>
                )
            }
        }
        return usersAndAssignments;
    }

    collapseAutocomplete = (target, prop) => {
        setTimeout(() => this.props.onChange("searchTerm", true)(""), 500);
    }
    render() {
        const { focus } = this.state;
        const {
            onChange,
            searchParams,
            getUsers,
            getAssignments,
            getTags,
            resetParams
        } = this.props;
        const { searchTerm } = searchParams;
        return(
            <nav className="navbar stories navbar-fixed-top navbar-default">
                <h1 className="md-type-title">Stories</h1>
                <section className="stories-search">

                    {
                        focus ?
                        <section >
                            <span className="mdi mdi-magnify icon"></span>
                            <input
                                id="story-search--text-input"
                                type="text"
                                value={ searchParams.searchTerm }
                                placeholder="Search for users or assignments"
                                onChange={(e) => onChange("searchTerm", true)(e.target.value)}
                                onBlur={ this.collapseAutocomplete } ></input>
                            <span className="mdi mdi-close icon" onClick={this.onFocus}></span>
                            <SearchDropdown
                                focus={ focus }
                                searchParams={ searchParams }
                                onChange={ onChange }
                                getUsers={ getUsers }
                                getAssignments={ getAssignments }
                                getTags={ getTags }
                                resetParams={ resetParams }
                                usersAndAssignments={ this.packSearchUsersAndAssignments() }/>
                            <AutocompleteDropdown
                                focus={searchTerm}
                                users={ this.packAutocompleteUsers() }
                                assignments={ this.packAutocompleteAssignments() }
                                onBlur={ this.collapseAutocomplete }/>
                        </section>
                        : <span className="mdi mdi-magnify icon" onClick={this.onFocus}></span>
                    }
                </section>

            </nav>
        );
    }
}

export default StoriesTopBar;

//Notes
// onClick outside of input field should close the search dropdown
