import React, { PropTypes } from 'react';
import * as pushActions from 'app/redux/modules/pushNotifs';
import 'app/sass/platform/_pushNotifs.scss';
import { connect } from 'react-redux';
import partial from 'lodash/partial';
import { Map } from 'immutable';
import TopBar from '../components/topbar';
import { Snackbar } from '../components/dialogs';
import Default from '../components/pushNotifs/default';
import GalleryList from '../components/pushNotifs/gallery-list';
import Recommend from '../components/pushNotifs/recommend';
import Assignment from '../components/pushNotifs/assignment';

class PushNotifs extends React.Component {
    static propTypes = {
        onSetActiveTab: PropTypes.func.isRequired,
        onChangeTemplate: PropTypes.func.isRequired,
        onConfirmError: PropTypes.func.isRequired,
        onSend: PropTypes.func.isRequired,
        activeTab: PropTypes.string.isRequired,
        loading: PropTypes.bool.isRequired,
        templates: PropTypes.object.isRequired,
        error: PropTypes.string,
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
            onConfirmError,
            activeTab,
            onSend,
            loading,
            error,
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
                        <Snackbar text={error} onShow={onConfirmError} />
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
        error: state.getIn(['pushNotifs', 'error']),
    };
}

export default connect(mapStateToProps, {
    onSetActiveTab: pushActions.setActiveTab,
    onChangeTemplate: pushActions.updateTemplate,
    onConfirmError: pushActions.confirmError,
    onSend: pushActions.send,
})(PushNotifs);

