import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as outlet from 'app/redux/actions/outlet';
import * as ui from 'app/redux/actions/ui';

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
        stripePublishableKey: PropTypes.string
    };

    state = {
        members: this.props.outlet.members ? this.props.outlet.members.filter(m => m.id !== this.props.outlet.owner.id) : [] //Hide outlet member
    };

    constructor(props) {
        super(props);
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
            ui,
            notificationSettings,
            clients,
            payment,
            stripePublishableKey
        } = this.props;
        const { members } = this.state;
        const isOwner = outlet.owner.id === user.id;
        const className = `outlet-settings ${!isOwner ? 'centered' : ''}`;

        return (
            <App
                user={user}
                page="Outlet Settings"
            >
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
                                stripePublishableKey={stripePublishableKey}
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
                        <Notifications />

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
        payment: state.payment,
        ui: state.ui,
        clients: state.clients
    }
}

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators(
        { ...outlet, ...ui },
        dispatch
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(OutletSettings);
