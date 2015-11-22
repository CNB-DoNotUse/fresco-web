import React from 'react'
import ReactDOM from 'react-dom'
import App from './app.js'
import TopBar from './../components/topbar-admin.js'

/**
 * Admin Page Component (composed of Admin Component and Navbar) 
 * 
 */

 class Admin extends React.Component {

 	constructor(props) {
 		super(props);
 		this.state = {
 			activeTab: 'submissions',
 			submissions: []
 		}

 		this.setTab = this.setTab.bind(this);
 	}

 	setTab(tab) {
 		if(tab == this.state.activeTab) return;

 		this.setState({
 			activeTab: tab
 		});
 	}

 	componentWillMount() {
 		$.get('http://staging.fresconews.com/v1/gallery/submissions', (submissions) => {
 			this.setState({
 				submissions: submissions
 			})
 		});
 	}

	render() {
		return (
			<App user={this.props.user}>
				<TopBar 
					activeTab={this.state.activeTab}
					setTab={this.setTab} />
			</App>
		)
	}

}

ReactDOM.render(
  <Admin 
  	user={window.__initialProps__.user} />,
	document.getElementById('app')
);
