import React, { PropTypes } from 'react';
import Tag from '../global/tag.js';
import reject from 'lodash/reject';

/**
 * Component for managing added/removed tags
 */
class EditAssignment extends React.Component {
    constructor(props) {
        super(props);
        this.state = { suggestions: [], query: '' };
    }

    componentWillMount() {
        document.addEventListener('click', (e) => this.onClick(e), false);
    }

    componentWillUnmount() {
        document.removeEventListener('click', (e) => this.onClick(e), false);
    }

    onClick(e) {
        // if (ReactDOM.findDOMNode(this.area).contains(e.target)) {
        if (this.area.contains(e.target)) {
            return;
        }

        this.setState({ query: '' });
    }

    onChangeQuery(e) {
        const query = e.target.value;
        this.setState({ query });

        // Enter is pressed, and query is present
        if (!query.length === 0) {
            this.setState({ suggestions: [] });
        } else {
            $.ajax({
                url: '/api/search',
                data: { 'assignments[a][title]': query },
                success: (res) => {
                    if (res.assignments && res.assignments.results) {
                        this.setState({ suggestions: res.assignments.results });
                    }
                },
            });
        }
    }

    onKeyUpQuery(e) {
        const { suggestions, query } = this.state;

        if (e.keyCode === 13 && query.length > 0) {
            const matched = suggestions.find((s) => (
                s.title.toLowerCase() === query.toLowerCase()
            ));

            if (matched) this.addAssignment(matched);
        }
    }

    /**
     * Adds assignment at passed index to current assignment
     * @param {[type]} index [description]
     */
    addAssignment(assignment) {
        let { assignments } = this.props;
        if (assignments.some((a) => (a.id === assignment.id))) return;
        assignments = assignments.concat(assignment);

        this.setState({ query: '' }, this.props.updateAssignments(assignments));
    }

    /**
     * Removes story and updates to parent
     */
    removeAssignment(id) {
        let { assignments } = this.props;
        assignments = reject(assignments, { id });

        this.props.updateAssignments(assignments);
    }

    render() {
        const { query, suggestions } = this.state;
        const { assignments } = this.props;
        const assignmentsJSX = assignments.map((a, i) => (
            <Tag
                key={i}
                text={a.title}
                plus={false}
                onClick={() => this.removeAssignment(a.id)}
            />
        ));

        const suggestionsJSX = suggestions.map((s, i) => (
            <li onClick={() => this.addAssignment(s)} key={i}>
                {s.title}
            </li>
        ));

        return (
            <div ref={(r) => this.area = r} className="dialog-row split chips">
                <div className="split-cell">
                    <input
                        type="text"
                        className="form-control floating-label"
                        placeholder="Assignment"
                        onChange={(e) => this.onChangeQuery(e)}
                        onKeyUp={(e) => this.onKeyUpQuery(e)}
                        value={query}
                    />

                    <ul
                        style={{ display: `${query.length ? 'block' : 'none'}` }}
                        className="dropdown"
                    >
                        {suggestionsJSX}
                    </ul>

                    <ul className="chips">
                        {assignmentsJSX}
                    </ul>
                </div>
            </div>
		);
    }
}

EditAssignment.propTypes = {
    updateAssignments: PropTypes.func.isRequired,
    assignments: PropTypes.array.isRequired,
};

export default EditAssignment;

