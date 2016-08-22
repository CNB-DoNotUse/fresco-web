import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
// import TopBar from './../components/topbar';

class PushNotifications extends React.component {
    render() {
        return (
            <div>Push notifications y'all</div>
        );
    }
}

function mapStateToProps(state) {
    return {
        notifications: state.getIn(['pushNotifications', 'pending']),
    };
}


export default connect(mapStateToProps)(PushNotifications);

