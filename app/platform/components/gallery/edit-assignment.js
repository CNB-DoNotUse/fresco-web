import React, { PropTypes } from 'react';
import Tag from '../editing/tag.js';

/**
 * Component for managing added/removed tags
 */
class EditAssignment extends React.Component {
    constructor(props) {
        super(props);
        this.state = { suggestions: [] };
    }

    change() {
        // Current fields input
        const query = this.refs.autocomplete.value;

        // Field is empty
        if (query.length === 0) {
            this.setState({ suggestions: [] });
            this.refs.dropdown.style.display = 'none';
        } else {
            this.refs.dropdown.style.display = 'block';

            $.ajax({
                url: '/api/search?assignments[rating]=1',
                data: { q: query },
                success: (res) => {
                    if (res.assignments && res.assignments.results) {
                        this.setState({ suggestions: res.assignments.results });
                    }
                },
            });
        }
    }

    /**
     * Adds assignment at passed index to current assignment
     * @param {[type]} index [description]
     */
    addAssignment(assignment) {
        if (this.props.assignment) {
            $.snackbar({ content: 'Submissions can only have one assignment!' });
            return;
        }

        // Clear the input field
        this.refs.autocomplete.value = '';
        this.refs.dropdown.style.display = 'none';

        // Send assignment up to parent
        this.props.updateAssignment(assignment);
    }

    render() {
        const { suggestions } = this.state;
        const { assignment, updateAssignment } = this.props;

        return (
            <div className="dialog-row split chips">
                <div className="split-cell">
                    <input
                        type="text"
                        className="form-control floating-label"
                        placeholder="Assignment"
                        onKeyUp={() => this.change()}
                        ref="autocomplete"
                    />

                    <ul ref="dropdown" className="dropdown">
                        {
                            suggestions && suggestions.length
                                ? suggestions.map((s, i) => (
                                    <li onClick={() => this.addAssignment(s)} key={i} >
                                        {s.title}
                                    </li>
                                    ))
                                : ''
                        }
                    </ul>

                    <ul className="chips">
                        {assignment
                            ? <Tag
                                text={assignment.title}
                                plus={false}
                                onClick={() => updateAssignment(null)}
                            />
                            : ''
                        }
                    </ul>
                </div>
            </div>
		);
    }
}

EditAssignment.defaultProps = {
    updateAssignment() {},
};

EditAssignment.propTypes = {
    updateAssignment: PropTypes.func.isRequired,
    assignment: PropTypes.object,
};

export default EditAssignment;

