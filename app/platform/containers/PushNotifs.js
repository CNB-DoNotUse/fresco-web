import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import partial from 'lodash/partial';
import { Map } from 'immutable';
import * as pushActions from 'app/redux/modules/pushNotifs';
import TopBar from '../components/topbar';
import DefaultTemplate from '../components/pushNotifs/default-template';
import GalleryListTemplate from '../components/pushNotifs/gallery-list-template';
import Recommend from '../components/pushNotifs/recommend';
import Assignment from '../components/pushNotifs/assignment';
import 'app/sass/platform/_pushNotifs.scss';

class PushNotifs extends React.Component {
    static propTypes = {
        setActiveTab: PropTypes.func.isRequired,
        onChangeTemplate: PropTypes.func.isRequired,
        send: PropTypes.func.isRequired,
        activeTab: PropTypes.string.isRequired,
        loading: PropTypes.bool.isRequired,
        templates: PropTypes.object.isRequired,
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
                return <GalleryListTemplate
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
                return <DefaultTemplate
                    {...templates.get('default', Map()).toJS()}
                    onChange={partial(onChangeTemplate, 'default')}
                />;
        }
    }

    render() {
        const {
            setActiveTab,
            activeTab,
            send,
            loading,
        } = this.props;

        return (
            <div className="container-fluid">
                <TopBar
                    title="Push Notifications"
                    tabs={['Default', 'Gallery List', 'Recommend', 'Assignment']}
                    setActiveTab={setActiveTab}
                    activeTab={activeTab}
                />
                <div className="push-notifs__tab row">
                    <div className="col-sm-8">
                        {this.renderTemplate()}
                        <button
                            type="button"
                            onClick={partial(send, activeTab)}
                            className="btn btn-flat pull-right"
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
    };
}

export default connect(mapStateToProps, {
    setActiveTab: pushActions.setActiveTab,
    onChangeTemplate: pushActions.updateTemplate,
    send: pushActions.send,
})(PushNotifs);

