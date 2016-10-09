import React, { PropTypes } from 'react';
import 'app/sass/platform/_moderation.scss';
import * as moderationActions from 'app/redux/modules/moderation';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import { connect } from 'react-redux';
import partial from 'lodash/partial';
import { Map, List } from 'immutable';
import Snackbar from 'material-ui/Snackbar';
import FrescoMasonry from '../components/global/fresco-masonry';
import TopBar from '../components/moderation/topbar';
import GalleryCard from '../components/moderation/gallery-card';
import UserCard from '../components/moderation/user-card';
import InfoDialog from '../components/dialogs/info';

class Moderation extends React.Component {
    static propTypes = {
        activeTab: PropTypes.string.isRequired,
        onSetActiveTab: PropTypes.func.isRequired,
        onClickFilter: PropTypes.func.isRequired,
        fetchGalleries: PropTypes.func.isRequired,
        onDismissAlert: PropTypes.func.isRequired,
        fetchUsers: PropTypes.func.isRequired,
        fetchSuspendedUsers: PropTypes.func.isRequired,
        onClickReportsIndex: PropTypes.func.isRequired,
        onDelete: PropTypes.func.isRequired,
        onSuspend: PropTypes.func.isRequired,
        onSkip: PropTypes.func.isRequired,
        onToggleGraphic: PropTypes.func.isRequired,
        onToggleSuspendedDialog: PropTypes.func.isRequired,
        suspendedDialog: PropTypes.bool.isRequired,
        loading: PropTypes.bool.isRequired,
        filters: PropTypes.instanceOf(Map).isRequired,
        galleries: PropTypes.instanceOf(List).isRequired,
        reports: PropTypes.instanceOf(Map).isRequired,
        users: PropTypes.instanceOf(List).isRequired,
        suspendedUsers: PropTypes.instanceOf(List).isRequired,
        alert: PropTypes.string,
    };

    componentDidMount() {
        $.material.init();
        this.fetchCurrentTab();
        this.props.fetchSuspendedUsers();
    }

    shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);

    componentDidUpdate(prevProps) {
        if (this.props.activeTab !== prevProps.activeTab) {
            this.fetchCurrentTab();
            $.material.init();
        }
    }

    fetchCurrentTab(more = false) {
        const { fetchGalleries, fetchUsers, activeTab, loading } = this.props;

        if (loading) return;
        if (activeTab === 'galleries') {
            fetchGalleries(more);
        } else if (activeTab === 'users') {
            fetchUsers(more);
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
            onDelete,
            onToggleGraphic,
        } = this.props;

        return (
            <FrescoMasonry
                className="moderation-masonry"
                ctrClassName="moderation-masonry__ctr"
                loadMore={() => this.fetchCurrentTab(true)}
            >
                {(activeTab === 'galleries' && galleries.size > 0) &&
                    galleries.map((g, i) => (
                        <GalleryCard
                            key={i}
                            {...g}
                            reportData={reports.getIn(['galleries', g.id], Map()).toJS()}
                            onClickReportsIndex={partial(onClickReportsIndex, 'galleries', g.id)}
                            onSuspend={partial(onSuspend, 'gallery', g.owner && g.id)}
                            onSkip={partial(onSkip, 'gallery', g.id)}
                            onDelete={partial(onDelete, 'gallery', g.id)}
                            onToggleGraphic={partial(onToggleGraphic, g.id)}
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
                                onSuspend={partial(onSuspend, 'user', u.id)}
                                onSkip={partial(onSkip, 'user', u.id)}
                                onDisable={partial(onDelete, 'user', u.id)}
                            />
                        ))
                }
            </FrescoMasonry>
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
            suspendedUsers,
            suspendedDialog,
            onToggleSuspendedDialog,
        } = this.props;

        return (
            <div className="moderation container-fluid">
                <TopBar
                    title="Moderation"
                    tabs={['galleries', 'users']}
                    setActiveTab={onSetActiveTab}
                    activeTab={activeTab}
                    onClickFilter={partial(onClickFilter, activeTab)}
                    filters={filters.get(activeTab)}
                    suspendedCount={suspendedUsers.size}
                    onToggleSuspendedDialog={onToggleSuspendedDialog}
                />

                <div className="moderation__content row">
                    <Snackbar
                        message={alert || ''}
                        open={!!alert}
                        autoHideDuration={5000}
                        onRequestClose={onDismissAlert}
                        onActionTouchTap={onDismissAlert}
                        onClick={onDismissAlert}
                    />

                    <InfoDialog
                        toggled={suspendedDialog}
                        onClose={onToggleSuspendedDialog}
                        header="Suspended users"
                    />

                    {this.renderContent()}
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    const filters = state.getIn(['moderation', 'filters']);
    const galleryFilters = filters.get('galleries');
    const userFilters = filters.get('users');
    const galleries = state
        .getIn(['moderation', 'galleries'])
        .filter(g => (
            galleryFilters.size === 0 || g.report_reasons.some(r => galleryFilters.includes(r)))
        );
    const users = state
        .getIn(['moderation', 'users'])
        .filter(g => userFilters.size === 0 || g.report_reasons.some(r => userFilters.includes(r)));

    return {
        activeTab: state.getIn(['moderation', 'activeTab']),
        loading: state.getIn(['moderation', 'loading']),
        alert: state.getIn(['moderation', 'alert']),
        reports: state.getIn(['moderation', 'reports']),
        suspendedUsers: state.getIn(['moderation', 'suspendedUsers']),
        suspendedDialog: state.getIn(['moderation', 'suspendedDialog']),
        galleries,
        users,
        filters,
    };
}

export default connect(mapStateToProps, {
    onClickFilter: moderationActions.toggleFilter,
    onDismissAlert: moderationActions.dismissAlert,
    onSetActiveTab: moderationActions.setActiveTab,
    fetchGalleries: moderationActions.fetchGalleries,
    fetchUsers: moderationActions.fetchUsers,
    fetchSuspendedUsers: moderationActions.fetchSuspendedUsers,
    onClickReportsIndex: moderationActions.updateReportsIndex,
    onSuspend: moderationActions.toggleSuspendUser,
    onSkip: moderationActions.skipCard,
    onDelete: moderationActions.deleteCard,
    onToggleGraphic: moderationActions.toggleGalleryGraphic,
    onToggleSuspendedDialog: moderationActions.toggleSuspendedDialog,
})(Moderation);

