import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import * as pushActions from 'app/redux/modules/pushNotifications';
import TopBar from '../topbar';
import DefaultTemplate from './default-template';
import GalleryListTemplate from './gallery-list-template';
import 'app/sass/platform/_pushNotifications.scss';

class PushNotifications extends React.Component {
    renderTemplate() {
        switch (this.props.activeTab.toLowerCase()) {
            case 'gallery list':
                return <GalleryListTemplate />;
            case 'default':
            default:
                return <DefaultTemplate />;
        }
    }

    render() {
        const { setActiveTab, activeTab } = this.props;

        return (
            <div className="container-fluid">
                <TopBar
                    title="Push"
                    tabs={['Default', 'Gallery List']}
                    setActiveTab={setActiveTab}
                    activeTab={activeTab}
                />
                <div className="push-notifications__tab">
                    {this.renderTemplate()}
                </div>
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

