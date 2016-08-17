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
        this.onClick = this.onClick.bind(this);
    }

    componentWillMount() {
        document.addEventListener('click', this.onClick);
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.onClick);
    }

    onClick(e) {
        // if (ReactDOM.findDOMNode(this.area).contains(e.target)) {
        if (this.area && this.area.contains(e.target)) {
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
        const { updateAssignment } = this.props;

        if (e.keyCode === 13 && query.length > 0) {
            const matched = suggestions.find((s) => (
                s.title.toLowerCase() === query.toLowerCase()
            ));

            if (matched) updateAssignment(matched);
        }
    }

    render() {
        const { query, suggestions } = this.state;
        const { assignment, updateAssignment } = this.props;
        const assignmentsJSX = assignment
            ? <Tag
                text={assignment.title}
                plus={false}
                onClick={() => updateAssignment(null)}
            />
            : null;

        const suggestionsJSX = suggestions && suggestions.length
            ? suggestions.map((s, i) => (
                <li
                    key={i}
                    onClick={() => {
                        updateAssignment(s);
                        this.setState({ query: '' });
                    }}
                >
                    {s.title}
                </li>
            ))
            : null;

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
    updateAssignment: PropTypes.func.isRequired,
    assignment: PropTypes.object,
};

export default EditAssignment;

