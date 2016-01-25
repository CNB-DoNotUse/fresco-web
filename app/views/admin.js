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

 		this.hasChangedData = this.hasChangedData.bind(this);

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

 	setTab(tab) {
 		if(tab == this.state.activeTab) return;

 		this.setState({
 			activeTab: tab
 		});
 	}

 	hasChangedData(newGalleries, currentGalleries) {
 		var newIDs = newGalleries.map(n => n._id),
 			curIDs = currentGalleries.map(c => c._id);

 		return _.difference(newIDs, curIDs).length > 0;
 		
 	}

	getAssignments() {
		$.get('/api/assignment/pending', {limit: 16}, (assignments) => {
			if( !assignments.data ) return;

			if(!this.hasChangedData(assignments.data, this.state.assignments)) return;

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

 			if(!this.hasChangedData(submissions.data, this.state.submissions)) return;

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

 			if(!this.hasChangedData(imports.data, this.state.imports)) return;

			var changedState = {
				imports: imports.data
			};

			if(imports.data.length)
				changedState.activeTab = 'imports';

			this.setState(changedState);
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
					getImports={this.getImports}
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
