import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import clone from 'lodash/clone';
import App from './app';
import TopBar from '../components/topbar';
import OutletInfo from '../components/outlet/outlet-info';
import OutletPaymentInfo from '../components/outlet/outlet-payment-info';
import QuickSupport from '../components/global/quick-support';
import OutletMembers from '../components/outlet/outlet-members';
import OutletLocations from '../components/outlet/locations';
import OutletNotifications from '../components/outlet/outlet-notifications';
import 'app/sass/platform/_outletSettings';

/**
 * Outlet Settings page
 */

class OutletSettings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            outlet: this.props.outlet,
        };

        this.updateMembers = this.updateMembers.bind(this);
        this.updateOutlet = this.updateOutlet.bind(this);
    }

    updateMembers(members) {
        const outlet = clone(this.state.outlet);
        outlet.members = members;

        this.setState({ outlet });
    }

    updateOutlet(outlet) {
        this.setState({ outlet });
    }

    render() {
        const { user, payment } = this.props;
        const isOwner = user.permissions.includes('update-outlet');
        const className = `outlet-settings ${!isOwner ? 'centered' : ''}`;
        let members = '';
        let left = '';

        if (isOwner) {
            left = (
                <div className="left">
                    <OutletInfo
                        updateOutlet={this.updateOutlet}
                        outlet={this.state.outlet}
                    />
                    <OutletPaymentInfo payment={payment} outlet={this.state.outlet} />
                </div>
            );
            members = (
                <OutletMembers
                    outlet={this.state.outlet}
                    updateMembers={this.updateMembers}
                    members={this.state.outlet.members}
                />
            );
        }

        return (
            <App user={user}>
                <TopBar
                    title={this.state.outlet.title}
                />

                <div className={className}>
                    {left}
                    <div className="right">
                        <OutletNotifications outlet={this.state.outlet} />
                        <OutletLocations outlet={this.state.outlet} />
                        {members}
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

