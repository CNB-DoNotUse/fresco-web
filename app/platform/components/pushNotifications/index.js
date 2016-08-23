import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import partial from 'lodash/partial';
import { Map } from 'immutable';
import * as pushActions from 'app/redux/modules/pushNotifications';
import TopBar from '../topbar';
import DefaultTemplate from './default-template';
import GalleryListTemplate from './gallery-list-template';
import 'app/sass/platform/_pushNotifications.scss';

class PushNotifications extends React.Component {
    componentDidMount() {
        $.material.init();
    }

    componentDidUpdate(prevProps) {
        if (this.props.activeTab !== prevProps.activeTab) {
            $.material.init();
        }
    }

    renderTemplate() {
        const { activeTab, onChangeTemplate, templates } = this.props;

        switch (activeTab.toLowerCase()) {
            case 'gallery list':
                return <GalleryListTemplate
                    {...templates.get('gallery list', Map()).toJS()}
                    onChange={partial(onChangeTemplate, 'gallery list')}
                />;
            case 'default':
            default:
                return <DefaultTemplate
                    {...templates.get('default', Map()).toJS()}
                    onChange={partial(onChangeTemplate, 'default')}
                />;
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
    onChangeTemplate: PropTypes.func.isRequired,
    activeTab: PropTypes.string.isRequired,
    templates: PropTypes.object,
};

function mapStateToProps(state) {
    return {
        // notifications: state.getIn(['pushNotifications', 'pending']),
        activeTab: state.getIn(['pushNotifications', 'activeTab']),
        templates: state.getIn(['pushNotifications', 'templates']),
    };
}

export default connect(mapStateToProps, {
    setActiveTab: pushActions.setActiveTab,
    onChangeTemplate: pushActions.updateTemplate,
})(PushNotifications);

