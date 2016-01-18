import React from 'react'
import ReactDOM from 'react-dom'
import App from './app'
import TopBar from './../components/topbar/topbar-admin'
import AdminBody from './../components/admin/admin-body'

/**
 * Admin Page Component (composed of Admin Component and Navbar) 
*/

 class Admin extends React.Component {

 	constructor(props) {
 		super(props);
 		this.state = {
 			activeTab: '',
 			assignments: [],
 			submissions: [],
 			imports: []
 		}

 		this.setTab = this.setTab.bind(this);

 		this.getAssignments = this.getAssignments.bind(this);
 		this.getSubmissions = this.getSubmissions.bind(this);
 		this.getImports = this.getImports.bind(this);

 		window.setInterval(() => {
 			switch (this.state.activeTab) {
 				case 'assignments':
 					this.getAssignments(); break;
 				case 'submissions':
 					this.getSubmissions(); break;
 				case 'imports':
 					this.getImports(); break;
 			}
 		}, 5000);
	}

	getAssignments() {
		$.get('/api/assignment/pending', {limit: 16}, (assignments) => {
			if( !assignments.data ) return;

			var changedState = {
				assignments: assignments.data
			};

			if(assignments.data.length)
				changedState.activeTab = 'assignments';

			this.setState(changedState);
		});
	}

	getSubmissions(cb) {
 		$.get('/api/gallery/submissions', (submissions) => {
 			if( !submissions.data ) return;

			var changedState = {
				submissions: submissions.data
			};

			if(submissions.data.length)
				changedState.activeTab = 'submissions';

			this.setState(changedState);
 		});
	}

	getImports(cb) {
		$.get('/api/gallery/imports?rated=0', (imports) => {
 			if( !imports.data ) return;

			var changedState = {
				imports: imports.data
			};

			if(imports.data.length)
				changedState.activeTab = 'imports';

			this.setState(changedState);
		});
	}

 	setTab(tab) {
 		if(tab == this.state.activeTab) return;

 		this.setState({
 			activeTab: tab
 		});
 	}

 	componentDidMount() {
 		this.getAssignments();
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
					assignments={this.state.assignments}
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
