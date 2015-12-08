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

	componentDidMount() {
	}

	render() {
		return (
			<App user={this.props.user}>
				<TopBar
					title={this.props.outlet.title}
					rank={this.props.user.rank}
					link="/outlet/settings"
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