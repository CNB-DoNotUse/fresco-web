import React, { PropTypes } from 'react';


class AutocompleteDropdown extends React.Component {


    render() {
        const { focus, users, assignments, onBlur } = this.props;
        return(
            <div className={ focus ? `show autocomplete-dropdown` : `none autocomplete-dropdown`}
                onBlur={ onBlur }>
                <section className="search-users">
                    <p>Users</p>
                    <ul>
                        { users }
                    </ul>
                </section>
                <section className="search-assignments">
                    <p>Assignments</p>
                    <ul>
                        { assignments }
                    </ul>
                </section>
            </div>
        )
    }
}

export default AutocompleteDropdown;
