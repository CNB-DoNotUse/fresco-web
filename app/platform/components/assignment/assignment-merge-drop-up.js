import React, { PropTypes } from 'react';
import Dropdown from '../global/dropdown';

class AssignmentMergeDropup extends React.Component {
    componentDidMount() {
        $(document).click((e) => {
            // Hide dropdown on click as long as not clicking on master button.
            if ($('.merge-dropdown').hasClass('active') && e.target.className != 'toggle') {
                $('.merge-dropdown').removeClass('active');
                $('.merge-dropdown .mdi-menu-up').removeClass('mdi-menu-up').addClass('mdi-menu-down');
            }
        });
    }

    renderAssignments(assignments) {
        const { selectMerge } = this.props;

        return assignments.map((a, i) => (
            <div
                key={i}
                className="assignment-merge-menu-item"
                onClick={() => selectMerge(a)}
            >
                <span className="assignment-title">
                    {a.title}
                </span>
                <span className="assignment-location">
                    {a.address}
                </span>
                <p className="assignment-caption">
                    {a.caption}
                </p>
            </div>
        ));
    }

    render() {
        const { nearbyAssignments } = this.props;
        if (!nearbyAssignments.length) return <div />;

        return (
            <Dropdown
                dropdownClass="merge-dropdown"
                title={`Merge (${this.props.nearbyAssignments.length})`}
                reverseCaretDirection
            >
                {this.renderAssignments(nearbyAssignments)}
            </Dropdown>
        );
    }
}

AssignmentMergeDropup.propTypes = {
    nearbyAssignments: PropTypes.array.isRequired,
    selectMerge: PropTypes.func.isRequired,
};

export default AssignmentMergeDropup;

