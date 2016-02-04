import React from 'react'
import ReactDOM from 'react-dom'
import App from './app'
import TopBar from '../components/topbar'
import OutletBody from '../components/outlet/outlet-body'
import OutletInfo from '../components/outlet/outlet-info'
import OutletPaymentInfo from '../components/outlet/outlet-payment-info'
import QuickSupport from '../components/global/quick-support'
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
					<div className="left">
						<OutletInfo outlet={this.props.user.outlet} />

						<OutletPaymentInfo outlet={this.props.user.outlet} />
					</div>
					<div className="right">
						<OutletLocations outlet={this.props.user.outlet} />	
						
						<OutletMembers
							outlet={this.props.outlet}
							updateMembers={this.updateMembers}
							members={this.state.members} />
					</div>

					<QuickSupport />
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