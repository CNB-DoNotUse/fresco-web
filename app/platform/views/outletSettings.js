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

        this.state = this.getStateFromProps(props);
    }

    getStateFromProps(props) {
        return {
            outlet: props.outlet,
            members: props.outlet.members || [],
        };
    }

    updateOutlet(outlet) {
        this.setState({ outlet });
    }

    render() {
        const { user, paymentSources } = this.props;
        const isOwner = user.permissions.includes('update-outlet');
        const className = `outlet-settings ${!isOwner ? 'centered' : ''}`;
        const { outlet, members } = this.state;

        return (
            <App user={user}>
                <TopBar
                    title={outlet.title}
                />

                <div className={className}>
                    {
                        isOwner
                            ? <div className="left">
                                <Info
                                    updateOutlet={(o) => this.updateOutlet(o)}
                                    outlet={outlet}
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
    paymentSources: PropTypes.array,
};

ReactDOM.render(
    <OutletSettings
        user={window.__initialProps__.user}
        outlet={window.__initialProps__.outlet}
        paymentSources={window.__initialProps__.paymentSources}
    />,
	document.getElementById('app')
);

