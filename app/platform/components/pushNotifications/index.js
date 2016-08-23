import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import * as pushActions from 'app/redux/modules/pushNotifications';
import TopBar from '../topbar';

class PushNotifications extends React.Component {
    render() {
        const { setActiveTab, activeTab } = this.props;

        return (
            <div>
                <TopBar
                    tabs={['Default', 'Gallery List']}
                    setActiveTab={setActiveTab}
                    activeTab={activeTab}
                />
            </div>
        );
    }
}

PushNotifications.propTypes = {
    setActiveTab: PropTypes.func.isRequired,
    activeTab: PropTypes.string.isRequired,
};

function mapStateToProps(state) {
    return {
        // notifications: state.getIn(['pushNotifications', 'pending']),
        activeTab: state.getIn(['pushNotifications', 'activeTab']),
    };
}

export default connect(mapStateToProps, {
    setActiveTab: pushActions.setActiveTab,
})(PushNotifications);

