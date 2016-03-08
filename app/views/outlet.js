import React from 'react'
import ReactDOM from 'react-dom'
import App from './app'
import TopBar from '../components/topbar'
import OutletBody from '../components/outlet/outlet-body'
import OutletBodyDemo from '../components/outlet/outlet-body-demo'

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

	edit() {
		window.location.href = "/outlet/settings";
	}

	render() {
		let topbarTabs = [];
		let outletBody = null;

		// Only show purchases if outlet has been verified
		if (this.props.outlet.verified) {
			topbarTabs = [
				'Vault',
				'Purchases'
			];
			outletBody =
				<OutletBody
					activeTab={this.state.activeTab}
					outlet={this.props.outlet}
					user={this.props.user} />;
		}
		else {
			outletBody =
				<OutletBodyDemo
					outlet={this.props.outlet} />
		}

		return (
			<App user={this.props.user}>
				<TopBar
					title={this.props.outlet.title}
					rank={this.props.user.rank}
					editable={true}
					edit={this.edit}
					editIcon={"mdi-settings"}
					activeTab={this.state.activeTab}
					setActiveTab={this.setActiveTab}
					tabs={topbarTabs} />
				{outletBody}
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
