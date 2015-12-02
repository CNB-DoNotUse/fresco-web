import React from 'react'
import ReactDOM from 'react-dom'
import App from './app'
import TopBar from '../components/topbar'
import OutletBody from '../components/outlet-body'
import OutletInfo from '../components/outlet-info'
import OutletCardInfo from '../components/outlet-card-info'
import OutletQuickSupport from '../components/outlet-quick-support'
import OutletMembers from '../components/outlet-members'

/**
	Outlet members page
*/

class OutletSettings extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		}
	}

	render() {
		return (
			<App user={this.props.user}>
				<TopBar
					title={this.props.user.outlet.title} />
				<div className="outlet-settings">
					<div>
						<OutletInfo outlet={this.props.user.outlet} />
						<OutletCardInfo outlet={this.props.user.outlet} />
						<OutletQuickSupport />
					</div>
					<div>
						<OutletMembers members={this.props.outlet.users} />
					</div>
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