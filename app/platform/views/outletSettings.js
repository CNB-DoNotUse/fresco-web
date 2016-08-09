import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import TopBar from '../components/topbar';
import Info from '../components/outlet/info';
import PaymentInfo from '../components/outlet/payment-info';
import Members from '../components/outlet/members';
import Locations from '../components/outlet/locations';
import Notifications from '../components/outlet/notifications';
import QuickSupport from '../components/global/quick-support';
import 'app/sass/platform/_outletSettings';

/**
 * Outlet Settings page
 */
class OutletSettings extends React.Component {
    constructor(props) {
        super(props);

        //User & outlet is in state so we can change the parent cmps. on update
        this.state = {
            outlet: props.outlet,
            user: props.user,
            members: props.outlet.members || [],
        }
    }

    updateOutlet(outlet) {
        this.state.user.outlet = outlet;
        this.setState({ 
            outlet,
            user: this.state.user
        });
    }

    updateMembers(members) {
        this.setState({ members });
    }

    render() {
        const { payment } = this.props;
        const { outlet, user } = this.state;
        const isOwner = user.permissions.includes('update-outlet');
        const className = `outlet-settings ${!isOwner ? 'centered' : ''}`;

        return (
            <App user={user}>
                <TopBar title={outlet.title} />

                <div className={className}>
                    {isOwner? 
                        <div className="left">
                            <Info
                                updateOutlet={(o) => this.updateOutlet(o)}
                                outlet={outlet}
                            />

                            <PaymentInfo
                                payment={payment}
                                outlet={this.state.outlet}
                            />
                        </div>
                        : ''
                    }
                    <div className="right">
                        <Notifications outlet={this.state.outlet} />

                        <Locations outlet={this.state.outlet} />

                        {isOwner ? 
                            <Members
                                outlet={this.state.outlet}
                                updateMembers={(o) => this.updateMembers(o)}
                                members={this.state.members}
                            />
                            : ''
                        }
                    </div>

                    <QuickSupport />
                </div>
            </App>
        );
    }
}

OutletSettings.propTypes = {
    user: PropTypes.object,
    outlet: PropTypes.object,
    payment: PropTypes.array,
};

ReactDOM.render(
    <OutletSettings
        user={window.__initialProps__.user}
        outlet={window.__initialProps__.outlet}
        payment={window.__initialProps__.payment}
    />,
	document.getElementById('app')
);