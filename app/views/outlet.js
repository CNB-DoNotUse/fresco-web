import React from 'react'
import ReactDOM from 'react-dom'
import App from './app'
import TopBar from '../components/topbar'
import OutletBody from '../components/outlet/outlet-body'

class Outlet extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			activeTab: 'Vault',
			purchases: []
		}

		this.setActiveTab = this.setActiveTab.bind(this);

	}

	setActiveTab(tab) {
		this.setState({
			activeTab: tab
		});
	}

	render() {

		var link = null;

		//Check if user is the owner
		if(this.props.outlet.owner._id != this.props.user._id)
			link = "/outlet/settings";

		return (
			<App user={this.props.user}>
				<TopBar
					title={this.props.outlet.title}
					rank={this.props.user.rank}
					link={null}
					activeTab={this.state.activeTab}
					setActiveTab={this.setActiveTab}
					tabs={[
						'Vault',
						'Purchases'
					]} />
				<OutletBody 
					activeTab={this.state.activeTab}
					outlet={this.props.outlet}
					user={this.props.user} />
			</App>
		)
	}
}

ReactDOM.render(
  <Outlet
  	user={window.__initialProps__.user}
  	outlet={window.__initialProps__.outlet} />,
	document.getElementById('app')
);