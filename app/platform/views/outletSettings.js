import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import TopBar from '../components/topbar';
import Info from '../components/outlet/info';
import PaymentInfo from '../components/outlet/payment-info';
import Members from '../components/outlet/members';
import Locations from '../components/outlet/locations';
import Notifications from '../components/outlet/notifications';
import APITokens from '../components/outlet/api-tokens';
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

        //User & outlet is in state so we can change the parent cmps. on update
        this.state = {
            outlet: props.outlet,
            user: props.user,
            members: props.outlet.members ? props.outlet.members.filter(m => m.id !== props.outlet.owner.id) : [] //Hide outlet member
        }
    }

    updateOutlet(outlet) {
        this.state.user.outlet = outlet;
        this.setState({ outlet, user: this.state.user });
    }

    updateMembers(members) {
        this.setState({ members });
    }

    render() {
        const { payment } = this.props;
        const { outlet, user, members } = this.state;
        const isOwner = outlet.owner.id === user.id;
        const className = `outlet-settings ${!isOwner ? 'centered' : ''}`;

        return (
            <App user={user}>
                <TopBar title={outlet.title} />

                <div className={className}>
                    <div className="left">
                        {isOwner && (
                            <Info
                                updateOutlet={(o) => this.updateOutlet(o)}
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
                            <APITokens
                                outlet={outlet}
                            />
                        )}

                        {isOwner && <QuickSupport />}
                    </div>
                    <div className="right">
                        <Notifications outlet={outlet} />
                        <Locations outlet={outlet} />

                        {isOwner && (
                            <Members
                                outlet={outlet}
                                updateMembers={(o) => this.updateMembers(o)}
                                members={members}
                            />
                        )}

                        {!isOwner && <QuickSupport />}
                    </div>
                </div>
            </App>
        );
    }
}

ReactDOM.render(
    <OutletSettings
        user={window.__initialProps__.user}
        outlet={window.__initialProps__.outlet}
        payment={window.__initialProps__.payment}
    />,
	document.getElementById('app')
);
