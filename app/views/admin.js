import React from 'react'
import ReactDOM from 'react-dom'
import App from './app'
import TopBar from './../components/topbar-admin'
import AdminBody from './../components/admin-body'

/**
 * Admin Page Component (composed of Admin Component and Navbar) 
 * 
 */

 class Admin extends React.Component {

 	constructor(props) {
 		super(props);
 		this.state = {
 			activeTab: 'submissions',
 			submissions: [],
 			imports: []
 		}

 		this.setTab = this.setTab.bind(this);
 		this.getSubmissions = this.getSubmissions.bind(this);
 		this.getImports = this.getImports.bind(this);
 		window.setInterval(() => {
 			switch (this.state.activeTab) {
 				case 'submissions':
 					this.getSubmissions(); break;
 				case 'imports':
 					this.getImports(); break;
 			}
 		}, 5000);
	}

	getSubmissions(cb) {
 		$.get('http://staging.fresconews.com/v1/gallery/submissions', (submissions) => {
 			this.setState({
 				submissions: submissions.data
 			});
 		});
	}

	getImports(cb) {
		$.get('/scripts/gallery/imports', (imports) => {
			this.setState({
				imports: imports.data
			})
		});
	}

 	setTab(tab) {
 		if(tab == this.state.activeTab) return;

 		this.setState({
 			activeTab: tab
 		});
 	}

 	componentDidMount() {
 		this.getSubmissions();
 		this.getImports();
 	}

	render() {
		return (
			<App user={this.props.user}>
				<TopBar 
					activeTab={this.state.activeTab}
					setTab={this.setTab} />
				<AdminBody 
					activeTab={this.state.activeTab}
					submissions={this.state.submissions}
					imports={this.state.imports} />
			</App>
		)
	}

}

ReactDOM.render(
  <Admin 
  	user={window.__initialProps__.user} />,
	document.getElementById('app')
);
