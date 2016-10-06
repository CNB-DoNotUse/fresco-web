import React, { PropTypes } from 'react';
import 'app/sass/platform/_moderation.scss';
import * as moderationActions from 'app/redux/modules/moderation';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import { connect } from 'react-redux';
import partial from 'lodash/partial';
import { Map, List } from 'immutable';
import Snackbar from 'material-ui/Snackbar';
import TopBar from '../components/moderation/topbar';
import GalleryCard from '../components/moderation/gallery-card';
import UserCard from '../components/moderation/user-card';

class Moderation extends React.Component {
    static propTypes = {
        activeTab: PropTypes.string.isRequired,
        onSetActiveTab: PropTypes.func.isRequired,
        onClickFilter: PropTypes.func.isRequired,
        fetchGalleries: PropTypes.func.isRequired,
        onDismissAlert: PropTypes.func.isRequired,
        fetchUsers: PropTypes.func.isRequired,
        onClickReportsIndex: PropTypes.func.isRequired,
        onSuspend: PropTypes.func.isRequired,
        onSkip: PropTypes.func.isRequired,
        loading: PropTypes.bool.isRequired,
        filters: PropTypes.instanceOf(Map).isRequired,
        galleries: PropTypes.instanceOf(List).isRequired,
        reports: PropTypes.instanceOf(Map).isRequired,
        users: PropTypes.instanceOf(List).isRequired,
        alert: PropTypes.string,
    };

    componentDidMount() {
        $.material.init();
        this.props.fetchGalleries();
        this.props.fetchUsers();
    }

    shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);

    componentDidUpdate(prevProps) {
        if (this.props.activeTab !== prevProps.activeTab) {
            $.material.init();
        }
    }

    renderContent() {
        const {
            activeTab,
            galleries,
            reports,
            users,
            onClickReportsIndex,
            onSuspend,
            onSkip,
        } = this.props;

        return (
            <div className="moderation-cards-ctr">
                {(activeTab === 'galleries' && galleries.size > 0) &&
                    galleries.map(g => (
                        <GalleryCard
                            key={g.id}
                            {...g}
                            reportData={reports.getIn(['galleries', g.id], Map()).toJS()}
                            onClickReportsIndex={partial(onClickReportsIndex, 'galleries', g.id)}
                            onSuspend={partial(onSuspend, g.owner && g.owner.id)}
                            onSkip={partial(onSkip, 'gallery', g.id)}
                        />
                    ))
                }

                {(activeTab === 'users' && users.size > 0) &&
                    users.map(u => (
                        <UserCard
                            key={u.id}
                            user={u}
                            reportData={reports.getIn(['users', u.id], Map()).toJS()}
                            onClickReportsIndex={partial(onClickReportsIndex, 'users', u.id)}
                            onSuspend={partial(onSuspend, u.id)}
                            onSkip={partial(onSkip, 'user', u.id)}
                        />
                    ))
                }
            </div>
        );
    }

    render() {
        const {
            onSetActiveTab,
            activeTab,
            onClickFilter,
            filters,
            alert,
            onDismissAlert,
        } = this.props;

        return (
            <div className="container-fluid">
                <TopBar
                    title="Moderation"
                    tabs={['galleries', 'users']}
                    setActiveTab={onSetActiveTab}
                    activeTab={activeTab}
                    onClickFilter={partial(onClickFilter, activeTab)}
                    filters={filters.get(activeTab)}
                />
                <div className="moderation-content-ctr">
                    <Snackbar
                        message={alert || ''}
                        open={!!alert}
                        autoHideDuration={5000}
                        onRequestClose={onDismissAlert}
                        onActionTouchTap={onDismissAlert}
                        onClick={onDismissAlert}
                    />

                    {this.renderContent()}
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        activeTab: state.getIn(['moderation', 'activeTab']),
        loading: state.getIn(['moderation', 'loading']),
        alert: state.getIn(['moderation', 'alert']),
        // TODO: replace with reducer scopes?
        galleries: state.getIn(['moderation', 'galleries']),
        users: state.getIn(['moderation', 'users']),
        reports: state.getIn(['moderation', 'reports']),
        filters: state.getIn(['moderation', 'filters']),
    };
}

export default connect(mapStateToProps, {
    onClickFilter: moderationActions.toggleFilter,
    onDismissAlert: moderationActions.dismissAlert,
    onSetActiveTab: moderationActions.setActiveTab,
    fetchGalleries: moderationActions.fetchGalleries,
    fetchUsers: moderationActions.fetchUsers,
    onClickReportsIndex: moderationActions.updateReportsIndex,
    onSuspend: moderationActions.toggleSuspendUser,
    onSkip: moderationActions.skipCard,
})(Moderation);

