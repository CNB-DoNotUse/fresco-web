// TODO: to be useed in admin-assignment-edit?
export default class AssignmentMergeDropup extends React.Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        $(document).click((e) => {
            // Hide dropdown on click as long as not clicking on master button.
            if($('.merge-dropdown').hasClass('active') && e.target.className != 'toggle') {
                $('.merge-dropdown').removeClass('active');
                $('.merge-dropdown .mdi-menu-up').removeClass('mdi-menu-up').addClass('mdi-menu-down');
            }
        })
    }

    render() {

        if(!this.props.nearbyAssignments.length)
            return <div />;

        return (
            <Dropdown
                dropdownClass="u-15 merge-dropdown"
                reverseCaretDirection={true}
                inList={true}
                title={'Merge (' + this.props.nearbyAssignments.length + ')'}>
                {this.props.nearbyAssignments.map((a, i) => {
                    return (
                        <div key={i} className="assignment-merge-menu-item" onClick={this.props.onClick}>
                            <span className="assignment-title">{this.props.assignment.title}</span>
                            <span className="assignment-location">{this.props.assignment.location.googlemaps}</span>
                            <p className="assignment-caption">{this.props.assignment.caption}</p>
                        </div>
                    );
                })}
            </Dropdown>
        );
    }
}

