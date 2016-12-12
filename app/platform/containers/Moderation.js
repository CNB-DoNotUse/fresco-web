import React, { PropTypes } from 'react';
import 'app/sass/platform/_moderation.scss';
import * as moderationActions from 'app/redux/modules/moderation';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import { connect } from 'react-redux';
import partial from 'lodash/partial';
import { Map, OrderedSet } from 'immutable';
import Snackbar from 'material-ui/Snackbar';
import FrescoMasonry from '../components/global/fresco-masonry';
import TopBar from '../components/moderation/topbar';
import GalleryCard from '../components/moderation/gallery-card';
import UserCard from '../components/moderation/user-card';
import ItemsDialog from '../components/dialogs/items';
import InfoDialog from '../components/dialogs/info';
import ConfirmDialog from '../components/dialogs/confirm';
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
        onRequestDelete: PropTypes.func.isRequired,
        onConfirmDelete: PropTypes.func.isRequired,
        onCancelDelete: PropTypes.func.isRequired,
        onSuspend: PropTypes.func.isRequired,
        onSkip: PropTypes.func.isRequired,
        onToggleGraphic: PropTypes.func.isRequired,
        onRestoreUser: PropTypes.func.isRequired,
        onToggleSuspendedDialog: PropTypes.func.isRequired,
        onToggleInfoDialog: PropTypes.func.isRequired,
        fadeOutCard: PropTypes.func.isRequired,
        suspendedDialog: PropTypes.bool.isRequired,
        infoDialog: PropTypes.object.isRequired,
        requestDeleted: PropTypes.instanceOf(Map).isRequired,
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
            onRequestDelete,
            onConfirmDelete,
            onToggleGraphic,
            fadeOutCard,
        } = this.props;

        let entitiesJSX;

        if (activeTab === 'galleries') {
            entitiesJSX = galleries.size > 0 ? (
                galleries.toJS().map(g => (
                    <GalleryCard
                        key={`gallery-card-${g.id}`}
                        {...g}
                        reportData={reports.getIn(['galleries', g.id], Map()).toJS()}
                        onClickReportsIndex={partial(onClickReportsIndex, 'galleries', g.id)}
                        onSuspend={partial(onSuspend, 'gallery', g.owner && g.id)}
                        onSkip={partial(fadeOutCard, 'gallery', g.id, onSkip)}
                        onDelete={partial(onRequestDelete, 'gallery', g.id)}
                        onToggleGraphic={partial(onToggleGraphic, g.id)}
                    />
                ))
            ) : [];
        } else if (activeTab === 'users') {
            entitiesJSX = users.size > 0 ? (
                users.toJS().map(u => (
                    <UserCard
                        key={`user-card-${u.id}`}
                        {...u}
                        reportData={reports.getIn(['users', u.id], Map()).toJS()}
                        onClickReportsIndex={partial(onClickReportsIndex, 'users', u.id)}
                        onSuspend={partial(onSuspend, 'user', u.id)}
                        onSkip={partial(fadeOutCard, 'user', u.id, onSkip)}
                        onDisable={partial(fadeOutCard, 'user', u.id, onConfirmDelete)}
                    />
                ))
            ) : [];
        }

        return (
            <FrescoMasonry
                className="moderation-masonry"
                ctrClassName="moderation-masonry__ctr"
                loadMore={() => this.fetchCurrentTab(true)}
            >
                {entitiesJSX}
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
            onCancelDelete,
            onConfirmDelete,
            requestDeleted,
            fadeOutCard,
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
                        emptyMessage="No suspended users"
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

                    <ConfirmDialog
                        onConfirm={partial(
                            fadeOutCard,
                            requestDeleted.get('entityType'),
                            requestDeleted.get('id'),
                            onConfirmDelete,
                        )}
                        onCancel={onCancelDelete}
                        toggled={!!requestDeleted.get('id')}
                        header="Confirm delete?"
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
    const activeTab = moderation.getIn(['ui', 'activeTab']);

    return {
        alert: moderation.getIn(['ui', 'alert']),
        reports: moderation.get('reports'),
        suspendedUsers: moderation.getIn(['suspendedUsers', 'entities']),
        suspendedDialog: moderation.getIn(['ui', 'suspendedDialog']),
        infoDialog: moderation.getIn(['ui', 'infoDialog']),
        requestDeleted: moderation.getIn([activeTab, 'requestDeleted']),
        activeTab,
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
    onToggleGraphic: moderationActions.toggleGalleryGraphic,
    onToggleSuspendedDialog: moderationActions.toggleSuspendedDialog,
    onToggleInfoDialog: moderationActions.toggleInfoDialog,
    onRestoreUser: moderationActions.restoreSuspendedUser,
    onRequestDelete: moderationActions.requestDeleteCard,
    onConfirmDelete: moderationActions.confirmDeleteCard,
    onCancelDelete: moderationActions.cancelDeleteCard,
    fadeOutCard: moderationActions.fadeOutCard,
})(Moderation);

