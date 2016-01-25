import React from 'react'
import ReactDOM from 'react-dom'
import App from './app'
import TopBar from '../components/topbar'
import OutletBody from '../components/outlet/outlet-body'
import OutletInfo from '../components/outlet/outlet-info'
import OutletPaymentInfo from '../components/outlet/outlet-payment-info'
import OutletQuickSupport from '../components/outlet/outlet-quick-support'
import OutletMembers from '../components/outlet/outlet-members'
import OutletLocations from '../components/outlet/outlet-locations'

/**
	Outlet members page
*/

class OutletSettings extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			members: this.props.outlet.users
		}

		this.updateMembers = this.updateMembers.bind(this);
	}

	updateMembers(members) {
		this.setState({
			members: members
		});
	}

	render() {
		return (
			<App user={this.props.user}>
				<TopBar
					title={this.props.user.outlet.title} />
				
				<div className="outlet-settings">

					<div className="outlet-settings-cards">
						<OutletInfo outlet={this.props.user.outlet} />

						<OutletLocations outlet={this.props.user.outlet} />	
						
						<OutletPaymentInfo outlet={this.props.user.outlet} />

						<OutletMembers 
							updateMembers={this.updateMembers}
							members={this.state.members} />
					</div>
					
					<OutletQuickSupport />
				</div>
			</App>
		)
	}
}

ReactDOM.render(
  <OutletSettings
  	user={window.__initialProps__.user}
  	outlet={window.__initialProps__.outlet} />,
	document.getElementById('app')
);