import React, { PropTypes } from 'react';
import 'app/sass/platform/_moderation.scss';
import * as moderationActions from 'app/redux/modules/moderation';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import { connect } from 'react-redux';
import partial from 'lodash/partial';
import { Map, List, OrderedSet } from 'immutable';
import Snackbar from 'material-ui/Snackbar';
import FrescoMasonry from '../components/global/fresco-masonry';
import TopBar from '../components/moderation/topbar';
import GalleryCard from '../components/moderation/gallery-card';
import UserCard from '../components/moderation/user-card';
import ItemsDialog from '../components/dialogs/items';
import InfoDialog from '../components/dialogs/info';
import SuspendedUser from '../components/moderation/suspended-user';

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
        onRestoreUser: PropTypes.func.isRequired,
        onToggleSuspendedDialog: PropTypes.func.isRequired,
        onToggleInfoDialog: PropTypes.func.isRequired,
        suspendedDialog: PropTypes.bool.isRequired,
        filters: PropTypes.instanceOf(Map).isRequired,
        galleries: PropTypes.instanceOf(OrderedSet).isRequired,
        reports: PropTypes.instanceOf(Map).isRequired,
        users: PropTypes.instanceOf(OrderedSet).isRequired,
        suspendedUsers: PropTypes.instanceOf(OrderedSet).isRequired,
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

    fetchCurrentTab() {
        const { fetchGalleries, fetchUsers, activeTab } = this.props;

        if (activeTab === 'galleries') {
            fetchGalleries();
        } else if (activeTab === 'users') {
            fetchUsers();
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

        const galleriesJSX = (activeTab === 'galleries' && galleries.size > 0) ? (
            galleries.toJS().map(g => (
                <GalleryCard
                    key={`gallery-card-${g.id}`}
                    {...g}
                    reportData={reports.getIn(['galleries', g.id], Map()).toJS()}
                    onClickReportsIndex={partial(onClickReportsIndex, 'galleries', g.id)}
                    onSuspend={partial(onSuspend, 'gallery', g.owner && g.id)}
                    onSkip={partial(onSkip, 'gallery', g.id)}
                    onDelete={partial(onDelete, 'gallery', g.id)}
                    onToggleGraphic={partial(onToggleGraphic, g.id)}
                />
            ))
        ) : [];

        const usersJSX = (activeTab === 'users' && users.size > 0) ? (
            users.toJS().map(u => (
                <UserCard
                    key={`user-card-${u.id}`}
                    user={u}
                    reportData={reports.getIn(['users', u.id], Map()).toJS()}
                    onClickReportsIndex={partial(onClickReportsIndex, 'users', u.id)}
                    onSuspend={partial(onSuspend, 'user', u.id)}
                    onSkip={partial(onSkip, 'user', u.id)}
                    onDisable={partial(onDelete, 'user', u.id)}
                />
            ))
        ) : [];

        return (
            <FrescoMasonry
                className="moderation-masonry"
                ctrClassName="moderation-masonry__ctr"
                loadMore={() => this.fetchCurrentTab(true)}
            >
                {galleriesJSX.concat(usersJSX)}
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
            onToggleInfoDialog,
            onRestoreUser,
            infoDialog,
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

                    <ItemsDialog
                        toggled={suspendedDialog}
                        onClose={onToggleSuspendedDialog}
                        header="Suspended users"
                    >
                        {suspendedUsers.toJS().map(s =>
                            <SuspendedUser
                                key={`suspended-user-${s.id}`}
                                user={s}
                                onClickRestore={partial(onRestoreUser, s.id)}
                            />
                        )}
                    </ItemsDialog>

                    <InfoDialog
                        toggled={infoDialog.get('open')}
                        onClose={onToggleInfoDialog}
                        header={infoDialog.get('header')}
                        body={infoDialog.get('body')}
                    />

                    {this.renderContent()}
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    const moderation = state.get('moderation');
    const filters = moderation.getIn(['ui', 'filters']);
    const galleryFilters = filters.get('galleries');
    const userFilters = filters.get('users');
    const galleries = moderation
        .getIn(['galleries', 'entities'])
        .filter(g => (galleryFilters.size === 0 ||
            g.get('report_reasons').some(r => galleryFilters.includes(r))));
    const users = moderation
        .getIn(['users', 'entities'])
        .filter(g => userFilters.size === 0 ||
            g.get('report_reasons').some(r => userFilters.includes(r)));

    return {
        activeTab: moderation.getIn(['ui', 'activeTab']),
        alert: moderation.getIn(['ui', 'alert']),
        reports: moderation.get('reports'),
        suspendedUsers: moderation.getIn(['suspendedUsers', 'entities']),
        suspendedDialog: moderation.getIn(['ui', 'suspendedDialog']),
        infoDialog: moderation.getIn(['ui', 'infoDialog']),
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
    onToggleInfoDialog: moderationActions.toggleInfoDialog,
    onRestoreUser: moderationActions.restoreSuspendedUser,
})(Moderation);

