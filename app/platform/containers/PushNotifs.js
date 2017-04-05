import React, { PropTypes } from 'react';
import * as pushActions from 'app/redux/modules/pushNotifs';
import { connect } from 'react-redux';
import partial from 'lodash/partial';
import get from 'lodash/get';
import { Map } from 'immutable';

import App from '../views/app';
import Snackbar from 'material-ui/Snackbar';
import Confirm from '../components/dialogs/confirm';
import Info from '../components/dialogs/info';
import TopBar from '../components/topbar';
import Default from '../components/pushNotifs/default-template';
import GalleryList from '../components/pushNotifs/gallery-list-template';
import Recommend from '../components/pushNotifs/recommend-template';
import SupportRequest from '../components/pushNotifs/support-request-template';
import Assignment from '../components/pushNotifs/assignment-template';

import 'app/sass/platform/_pushNotifs.scss';

const getConfirmText = (template) => {
    const restrictedByUser = get(template, 'restrictByUser', false);
    const restrictedByLocation = get(template, 'restrictByLocation', false);

    if (get(template, 'assignment', false) && (!restrictedByUser && !restrictedByLocation)) {
        return 'This notification will be sent to every user near the selected assignment!';
    }

    if (restrictedByLocation) {
        return 'This notification will be sent to every user in the selected location!';
    }

    if (!restrictedByUser && !restrictedByLocation) {
        return 'This notification will be sent to every user!';
    }

    return null;
};

class PushNotifs extends React.Component {
    static propTypes = {
        onSetActiveTab: PropTypes.func.isRequired,
        onChangeTemplate: PropTypes.func.isRequired,
        onChangeTemplateAsync: PropTypes.func.isRequired,
        onDismissAlert: PropTypes.func.isRequired,
        onSend: PropTypes.func.isRequired,
        activeTab: PropTypes.string.isRequired,
        activeTemplate: PropTypes.object.isRequired,
        loading: PropTypes.bool.isRequired,
        infoDialog: PropTypes.instanceOf(Map),
        requestConfirmSend: PropTypes.bool.isRequired,
        cancelSend: PropTypes.func.isRequired,
        confirmSend: PropTypes.func.isRequired,
        onCloseInfoDialog: PropTypes.func.isRequired,
        alert: PropTypes.string,
    };

    componentDidMount() {
        $.material.init();
    }

    componentDidUpdate(prevProps) {
        if (this.props.activeTab !== prevProps.activeTab) {
            $.material.init();
        }
    }

    renderTemplate() {
        const {
            activeTab,
            activeTemplate,
            onChangeTemplate,
            onChangeTemplateAsync,
        } = this.props;
        const activeTabKey = activeTab.toLowerCase();

        const props = {
            ...activeTemplate,
            onChange: partial(onChangeTemplate, activeTabKey),
            onChangeAsync: partial(onChangeTemplateAsync, activeTabKey),
        };

        switch (activeTabKey) {
            case 'gallery list':
                return <GalleryList {...props} />;
            case 'assignment':
                return <Assignment {...props} />;
            case 'recommend':
                return <Recommend {...props} />;
            case 'support request':
                return <SupportRequest {...props} />;
            case 'default':
            default:
                return <Default {...props} />;
        }
    }

    render() {
        const {
            onSetActiveTab,
            onDismissAlert,
            onSend,
            onCloseInfoDialog,
            activeTab,
            loading,
            alert,
            requestConfirmSend,
            cancelSend,
            confirmSend,
            infoDialog,
            page,
            activeTemplate,
            user
        } = this.props;

        return (
            <App page='push' user={user}>
                <div className="container-fluid">
                    <TopBar
                        title="Push Notifications"
                        tabs={['Default', 'Gallery List', 'Recommend', 'Assignment', 'Support Request']}
                        setActiveTab={onSetActiveTab}
                        activeTab={activeTab}
                    />
                    <div className="push-notifs__tab">
                        <div className="col-md-8 col-md-offset-2 col-lg-6 col-lg-offset-3">
                            <Snackbar
                                message={alert || ''}
                                open={!!alert}
                                autoHideDuration={5000}
                                onRequestClose={onDismissAlert}
                                onActionTouchTap={onDismissAlert}
                                onClick={onDismissAlert}
                                bodyStyle={{ height: 'auto', whiteSpace: 'pre-line' }}
                            />

                            {this.renderTemplate()}

                            <button
                                type="button"
                                onClick={partial(onSend, activeTab)}
                                className="btn btn-raised btn-primary pull-right push-notifs__send"
                                disabled={loading}
                            >
                                Send
                            </button>
                        </div>

                        <Confirm
                            header="Send notification?"
                            body={getConfirmText(activeTemplate)}
                            onConfirm={partial(confirmSend, activeTab)}
                            onCancel={cancelSend}
                            toggled={requestConfirmSend}
                            disabled={loading}
                            hasInput={false}
                        />

                        <Info
                            onClose={onCloseInfoDialog}
                            header={infoDialog.get('header')}
                            body={infoDialog.get('body')}
                            toggled={infoDialog.get('visible')}
                        />
                    </div>
                </div>
            </App>
        );
    }
}

function mapStateToProps(state) {
    const user = state.get('user', Map()).toJS();
    const activeTab = state.getIn(['pushNotifs', 'activeTab']);
    const templates = state.getIn(['pushNotifs', 'templates']);
    const activeTemplate = templates.get(activeTab.toLowerCase(), Map()).toJS();

    return {
        activeTab,
        activeTemplate,
        loading: state.getIn(['pushNotifs', 'loading']),
        alert: state.getIn(['pushNotifs', 'alert']),
        requestConfirmSend: state.getIn(['pushNotifs', 'requestConfirmSend']),
        infoDialog: state.getIn(['pushNotifs', 'infoDialog']),
        user
    };
}

export default connect(mapStateToProps, {
    onSetActiveTab: pushActions.setActiveTab,
    onChangeTemplate: pushActions.updateTemplate,
    onChangeTemplateAsync: pushActions.updateTemplateAsync,
    onDismissAlert: pushActions.dismissAlert,
    onSend: pushActions.send,
    confirmSend: pushActions.confirmSend,
    cancelSend: pushActions.cancelSend,
    onCloseInfoDialog: pushActions.closeInfoDialog,
})(PushNotifs);
