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

 		this.currentXHR = null;
 		this.clearXHR = this.clearXHR.bind(this);

 		this.setTab = this.setTab.bind(this);

 		this.getChangedData = this.getChangedData.bind(this);

 		this.getData = this.getData.bind(this);

 		this.resetAssignments = this.resetAssignments.bind(this);
 		this.resetSubmissions = this.resetSubmissions.bind(this);
 		this.resetImports = this.resetImports.bind(this);

 		this.refresh = this.refresh.bind(this);
	}

 	componentDidMount() {
 		this.loadInitial();
 	}

 	componentDidUpdate(prevProps, prevState) {
 		if(this.state.activeTab && prevState.activeTab && prevState.activeTab != this.state.activeTab) {
 			switch(this.state.activeTab) {
 				case 'assignments':
 					this.resetAssignments();
 					break;
 				case 'submissions':
 					this.resetSubmissions();
 					break;
 				case 'imports':
 					this.resetImports();
 					break;
 			}
 		}
 	}

 	/**
 	 * Clear any pending XHR requests
 	 */
 	clearXHR() {
		if(this.currentXHR != null) {
			this.currentXHR.abort();
			this.currentXHR = null;
		}
 	}

 	setTab(tab) {
 		if(tab == this.state.activeTab) return;

 		this.setState({
 			activeTab: tab
 		});
 	}

 	getChangedData(newGalleries, currentGalleries) {
 		var newIDs = newGalleries.map(n => n._id),
 			curIDs = currentGalleries.map(c => c._id);

 		var diffIds = _.difference(newIDs, curIDs),
 			diffGalleries = [];

 		for(var x in newGalleries) {
 			if(diffIds.indexOf(newGalleries[x]._id) != -1) {
 				diffGalleries.push(newGalleries[x]);
 			}

 			if(diffIds.length == diffGalleries.length) break;

 		}

 		return diffGalleries;
 		
 	}

 	/**
 	 * Query for initial data. Set the active tab to a tab with data.
 	 */
 	loadInitial() {
 		var activeTab = '';

 		var tryLoadAssignments = () => {

	 		this.getData(undefined, {tab: 'assignments'}, (assignments) => {
	 			activeTab = assignments.length ? 'assignments' : activeTab;
	 			this.setState({
	 				assignments: this.state.assignments.concat(assignments)
	 			});
	 			tryLoadSubmissions();
	 		});
 		}

 		var tryLoadSubmissions = () => {
	 		this.getData(undefined, {tab: 'submissions'}, (submissions) => {
	 			activeTab = submissions.length ? 'submissions' : activeTab;
	 			this.setState({
	 				submissions: this.state.submissions.concat(submissions)
	 			});
	 			tryLoadImports();
	 		});
 		}

 		var tryLoadImports = () => {
	 		this.getData(undefined, {tab: 'imports'}, (imports) => {
	 			this.setState({
	 				activeTab: activeTab.length ? activeTab : 'imports',
	 				imports: this.state.imports.concat(imports)
	 			});
	 		});
 		}

 		tryLoadAssignments();

 	}

 	refresh() {

 		this.getData(undefined, {unshift: true, tab: this.state.activeTab}, (data) => {});

 	}

	getData(last, options, cb) {
		var concat = false, unshift = false, endpoint = '', params = {}, tab = options.tab || this.state.activeTab, newState = {};

		// Set up endpoint and params depending on tab
		switch(tab) {
			case 'assignments':
				endpoint = '/api/assignment/list';
				params = { verified: false, expired: false, limit: 16, last: last };
				break;

			case 'submissions':
				endpoint = '/api/gallery/submissions';
				params = { last: last, limit: 16 };
				break;

			case 'imports':
				endpoint = '/api/gallery/imports';
				params = { last: last, limit: 16, rated: 0 };
				break;
		}


		if(typeof cb == 'undefined') {
			cb = options;
		} else if(options.concat) {
			concat = true;
		} else if(options.unshift) {
			unshift = true;
		}

		this.clearXHR();

		this.currentXHR = $.get(endpoint, params, (data) => {

			if (!data.data) {
				return cb([]);
			}

			var stateData = this.state[tab];

			var newData = this.getChangedData(stateData.concat(data.data), stateData);


			if(!newData.length) {
				return cb([]);
			}

			if(concat || unshift) {

				if(concat) {
					stateData = stateData.concat(data.data);
				}

				if(unshift) {

					// Filter posts newer than newest
					for (var i = 0; i < newData.length; i++) {
						if(newData[i].time_created < stateData[0].time_created) {
							newData.splice(i, 1);
						}
					};
					stateData.unshift(...newData);
				}

				newState[tab] = stateData;

				this.setState(newState);

			}

			cb(data.data);

		});

	}

	resetAssignments() {
		this.getData(undefined, {tab: 'assignments'}, (assignments) => {
			this.setState({
				activeTab: 'assignments',
				assignments: assignments.length ? assignments : this.state.assignments
			})
		});
	}

	resetSubmissions() {
		this.getData(undefined, {tab: 'submissions'}, (submissions) => {
			this.setState({
				activeTab: 'submissions',
				submissions: submissions.length ? submissions : this.state.submissions
			})
		});
	}

	resetImports() {
		this.getData(undefined, {tab: 'imports'}, (imports) => {
			this.setState({
				activeTab: 'imports',
				imports: imports.length ? imports : this.state.imports
			})
		});
	}

	render() {
		return (
			<App user={this.props.user}>
				<TopBar
					activeTab={this.state.activeTab}
					resetImports={this.resetImports}
					setTab={this.setTab} />
				<AdminBody
					activeTab={this.state.activeTab}
					assignments={this.state.assignments}
					submissions={this.state.submissions}
					imports={this.state.imports}
					getData={this.getData}
					refresh={this.refresh} />
			</App>
		)
	}

}

ReactDOM.render(
  <Admin 
  	user={window.__initialProps__.user} />,
	document.getElementById('app')
);
