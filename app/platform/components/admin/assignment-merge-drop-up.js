import React, { PropTypes } from 'react';

class AssignmentMergeDropup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            active: false,
        };
    }

    componentDidMount() {
        $(document).click((e) => {
            // Hide dropdown on click as long as not clicking on master button.
            if ($(e.target).parents('.merge-dropup').size() === 0
                && e.target.className !== 'merge-dropup__toggle') {
                this.setState({ active: false });
            }
        });
    }

    componentWillUnmount() {
        // Clean up click event on unmount
        $(document).unbind('click');
    }

    onToggle() {
        this.setState({ active: !this.state.active });
    }

    renderAssignments(assignments) {
        const { onSelectMerge } = this.props;

        return assignments.map((a, i) => (
            <div
                key={i}
                className="merge-dropup__menu-item"
                onClick={() => onSelectMerge(a)}
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
        const { active } = this.state;

        if (active) {
            return (
                <div className={'merge-dropup merge-dropup--active pull-right '}>
                    <div className="merge-dropup__toggle merge-dropup__toggle--active" onClick={() => this.onToggle()} >
                        <span>{`Merge (${nearbyAssignments.length})`}</span>
                        <i className={'mdi mdi-menu-down pull-right'} />
                    </div>

                    <div className="merge-dropup__body">
                        {this.renderAssignments(nearbyAssignments)}
                    </div>
                </div>

            );
        }

        return (
            <div className={'merge-dropup pull-right btn'}  onClick={() => this.onToggle()}>
                <div className="merge-dropup__toggle">
                    <span>{`Merge (${nearbyAssignments.length})`}</span>
                    <i className={'mdi mdi-menu-up'} />
                </div>
            </div>

        );
    }
}

AssignmentMergeDropup.propTypes = {
    nearbyAssignments: PropTypes.array.isRequired,
    onSelectMerge: PropTypes.func.isRequired,
};

export default AssignmentMergeDropup;

