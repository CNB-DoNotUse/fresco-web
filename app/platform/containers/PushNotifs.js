import React, { PropTypes } from 'react';
import * as pushActions from 'app/redux/modules/pushNotifs';
import 'app/sass/platform/_pushNotifs.scss';
import { connect } from 'react-redux';
import partial from 'lodash/partial';
import { Map } from 'immutable';
import Snackbar from 'material-ui/Snackbar';
import Confirm from '../components/dialogs/confirm';
import Info from '../components/dialogs/info';
import TopBar from '../components/topbar';
import Default from '../components/pushNotifs/default-template';
import GalleryList from '../components/pushNotifs/gallery-list-template';
import Recommend from '../components/pushNotifs/recommend-template';
import Assignment from '../components/pushNotifs/assignment-template';

class PushNotifs extends React.Component {
    static propTypes = {
        onSetActiveTab: PropTypes.func.isRequired,
        onChangeTemplate: PropTypes.func.isRequired,
        onChangeTemplateAsync: PropTypes.func.isRequired,
        onDismissAlert: PropTypes.func.isRequired,
        onSend: PropTypes.func.isRequired,
        activeTab: PropTypes.string.isRequired,
        loading: PropTypes.bool.isRequired,
        templates: PropTypes.object.isRequired,
        requestConfirmSend: PropTypes.bool.isRequired,
        cancelSend: PropTypes.func.isRequired,
        confirmSend: PropTypes.func.isRequired,
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
        const { activeTab, onChangeTemplate, onChangeTemplateAsync, templates } = this.props;
        const activeTabKey = activeTab.toLowerCase();

        const props = {
            ...templates.get(activeTabKey, Map()).toJS(),
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
        } = this.props;

        return (
            <div className="container-fluid">
                <TopBar
                    title="Push Notifications"
                    tabs={['Default', 'Gallery List', 'Recommend', 'Assignment']}
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
                        text={"Send notification?"}
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
        );
    }
}

function mapStateToProps(state) {
    return {
        activeTab: state.getIn(['pushNotifs', 'activeTab']),
        templates: state.getIn(['pushNotifs', 'templates']),
        loading: state.getIn(['pushNotifs', 'loading']),
        alert: state.getIn(['pushNotifs', 'alert']),
        requestConfirmSend: state.getIn(['pushNotifs', 'requestConfirmSend']),
        infoDialog: state.getIn(['pushNotifs', 'infoDialog']),
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

