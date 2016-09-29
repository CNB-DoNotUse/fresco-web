import React, { PropTypes } from 'react';
import * as pushActions from 'app/redux/modules/pushNotifs';
import 'app/sass/platform/_pushNotifs.scss';
import { connect } from 'react-redux';
import partial from 'lodash/partial';
import { Map } from 'immutable';
import Snackbar from 'material-ui/Snackbar';
import Confirm from '../components/dialogs/confirm';
import TopBar from '../components/topbar';
import Default from '../components/pushNotifs/default-template';
import GalleryList from '../components/pushNotifs/gallery-list-template';
import Recommend from '../components/pushNotifs/recommend-template';
import Assignment from '../components/pushNotifs/assignment-template';

class PushNotifs extends React.Component {
    static propTypes = {
        onSetActiveTab: PropTypes.func.isRequired,
        onChangeTemplate: PropTypes.func.isRequired,
        onConfirmAlert: PropTypes.func.isRequired,
        onSend: PropTypes.func.isRequired,
        activeTab: PropTypes.string.isRequired,
        loading: PropTypes.bool.isRequired,
        templates: PropTypes.object.isRequired,
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
        const { activeTab, onChangeTemplate, templates } = this.props;

        switch (activeTab.toLowerCase()) {
            case 'gallery list':
                return <GalleryList
                    {...templates.get('gallery list', Map()).toJS()}
                    onChange={partial(onChangeTemplate, 'gallery list')}
                />;
            case 'assignment':
                return <Assignment
                    {...templates.get('assignment', Map()).toJS()}
                    onChange={partial(onChangeTemplate, 'assignment')}
                />;
            case 'recommend':
                return <Recommend
                    {...templates.get('recommend', Map()).toJS()}
                    onChange={partial(onChangeTemplate, 'recommend')}
                />;
            case 'default':
            default:
                return <Default
                    {...templates.get('default', Map()).toJS()}
                    onChange={partial(onChangeTemplate, 'default')}
                />;
        }
    }

    render() {
        const {
            onSetActiveTab,
            onConfirmAlert,
            onToggleConfirmSend,
            onSend,
            activeTab,
            loading,
            alert,
            confirmSendToggled,
        } = this.props;

        return (
            <div className="container-fluid">
                <TopBar
                    title="Push Notifications"
                    tabs={['Default', 'Gallery List', 'Recommend', 'Assignment']}
                    setActiveTab={onSetActiveTab}
                    activeTab={activeTab}
                />
                <div className="push-notifs__tab row">
                    <div className="col-md-8 col-md-offset-2 col-lg-6 col-lg-offset-3">
                        <Snackbar
                            message={alert || ''}
                            open={!!alert}
                            autoHideDuration={5000}
                            onRequestClose={onConfirmAlert}
                            onActionTouchTap={onConfirmAlert}
                            onClick={onConfirmAlert}
                        />
                        {this.renderTemplate()}
                        <button
                            type="button"
                            onClick={onToggleConfirmSend}
                            className="btn btn-raised btn-primary pull-right push-notifs__send"
                            disabled={loading}
                        >
                            Send
                        </button>
                    </div>
                </div>
                <Confirm
                    text={"Send notificaiton?"}
                    onConfirm={partial(onSend, activeTab)}
                    onCancel={onToggleConfirmSend}
                    toggled={confirmSendToggled}
                    hasInput={false}
                />
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
        confirmSendToggled: state.getIn(['pushNotifs', 'confirmSendToggled']),
    };
}

export default connect(mapStateToProps, {
    onSetActiveTab: pushActions.setActiveTab,
    onChangeTemplate: pushActions.updateTemplate,
    onConfirmAlert: pushActions.confirmAlert,
    onToggleConfirmSend: pushActions.toggleConfirmSend,
    onSend: pushActions.send,
})(PushNotifs);

