import React from 'react';
import { connect } from 'react-redux';
// import TopBar from './../components/topbar';

class PushNotifications extends React.Component {
    render() {
        return (
            <div>Push notifications y'all</div>
        );
    }
}

function mapStateToProps(state) {
    return {
        // notifications: state.getIn(['pushNotifications', 'pending']),
        notifications: state.pushNotifications,
    };
}

export default connect(mapStateToProps)(PushNotifications);

