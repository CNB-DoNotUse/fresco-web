import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import * as outlet from 'app/redux/actions/outlet';
import * as ui from 'app/redux/actions/ui';
import * as notificationSettings from 'app/redux/actions/notificationSettings';
import * as clients from 'app/redux/actions/clients';

import App from '../views/app';
import TopBar from '../components/topbar';
import Info from '../components/outlet/info';
import PaymentInfo from '../components/outlet/payment-info';
import Members from '../components/outlet/members';
import Locations from '../components/outlet/locations';
import Notifications from '../components/outlet/notifications';
import Clients from '../components/outlet/clients';
import QuickSupport from '../components/global/quick-support';
import 'app/sass/platform/_outletSettings';

/**
 * Outlet Settings page
 */
class OutletSettings extends React.Component {
    static propTypes = {
        user: PropTypes.object,
        outlet: PropTypes.object,
        payment: PropTypes.array,
    };

    constructor(props) {
        super(props);

        // //User & outlet is in state so we can change the parent cmps. on update
        // this.state = {
        //     outlet: props.outlet,
        //     user: props.user,
        //     members: props.outlet.members ? props.outlet.members.filter(m => m.id !== props.outlet.owner.id) : [] //Hide outlet member
        // }
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.ui.showSnackbar) {
            $.snackbar({ content: nextProps.ui.snackbarText });
            this.props.toggleSnackbar('', false);
        }
    }

    updateMembers(members) {
        this.setState({ members });
    }


    render() {
        const { 
            outlet, 
            user, 
            members, 
            ui, 
            notificationSettings, 
            clients,
            payment, 
            stripePublishableKey 
        } = this.props;
        const isOwner = outlet.owner.id === user.id;
        const className = `outlet-settings ${!isOwner ? 'centered' : ''}`;

        return (
            <App 
                user={user}
                page="outletSettings">
                <TopBar title={outlet.title} />

                <div className={className}>
                    <div className="left">
                        {isOwner && (
                            <Info
                                updateOutlet={this.props.updateOutlet}
                                updateAvatar={this.props.updateAvatar}
                                isLoading={ui.isLoading}
                                outlet={outlet}
                            />
                        )}

                        {isOwner && (
                            <PaymentInfo
                                payment={payment}
                                outlet={outlet}
                            />
                        )}

                        {isOwner && (
                            <Clients
                                outlet={outlet}
                                clients={clients}
                                isLoading={ui.isLoading}
                                getClients={this.props.getClients}
                                updateClient={this.props.updateClient}
                            />
                        )}
                    </div>
                    <div className="right">
                        <Notifications 
                            loadNotifications={this.props.loadNotifications}
                            notificationSettings={notificationSettings}
                            updateNotification={this.props.updateNotification}
                            outlet={outlet} />
                        
                        <Locations outlet={outlet} />

                        {isOwner && (
                            <Members
                                outlet={outlet}
                                updateMembers={(o) => this.updateMembers(o)}
                                members={members}
                            />
                        )}

                        <QuickSupport />
                    </div>
                </div>
            </App>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        outlet: state.outlet,
        user: state.user,
        members: state.members,
        ui: state.ui,
        notificationSettings: state.notificationSettings,
        clients: state.clients
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        updateOutlet: (params, avatarFiles) => {
            dispatch(outlet.updateOutlet(params, avatarFiles))
        },
        updateAvatar: (avatarFiles, calledWithInfo) => {
            dispatch(outlet.updateAvatar(avatarFiles, calledWithInfo))
        },
        updateMembers: (members) => {
            dispatch(outlet.updateOutlet(members))
        },
        toggleSnackbar: (snackBarText, shown) => {
            dispatch(ui.toggleSnackbar(snackBarText, shown))
        },
        receiveNotifications: (notifications) => {
            dispatch(notifications)
        },
        loadNotifications: () => {
            dispatch(notificationSettings.loadNotifications());
        },
        updateNotification: (option, index, e) => {
            dispatch(notificationSettings.updateNotification(option,index,e))
        },
        getClients: () => {
            dispatch(clients.getClients());
        },
        updateClient: (...args) => {
            dispatch(clients.updateClient(...args));
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(OutletSettings);