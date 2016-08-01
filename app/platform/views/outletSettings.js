import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import clone from 'lodash/clone';
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

        return (
            <App user={user}>
                <TopBar
                    title={this.state.outlet.title}
                />

                <div className={className}>
                    {
                        isOwner
                            ? <div className="left">
                                <Info
                                    updateOutlet={this.updateOutlet}
                                    outlet={this.state.outlet}
                                />
                                
                                <PaymentInfo 
                                    payment={payment} 
                                    outlet={this.state.outlet} />
                            </div>
                            : ''
                    }
                    <div className="right">
                        <Notifications outlet={this.state.outlet} />
                        
                        <Locations outlet={this.state.outlet} />
                        
                        {isOwner ? 
                            <Members
                                outlet={this.state.outlet}
                                updateMembers={this.updateMembers}
                                members={this.state.outlet.members}
                            />
                            : 
                            ''
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

