import React from 'react'
import ReactDOM from 'react-dom'
import TopBar from './../components/topbar'
import PostList from './../components/post-list'
import AssignmentSidebar from './../components/assignment-sidebar'
import AssignmentEdit from './../components/editing/assignment-edit.js'
import App from './app'

/**
 * Story Detail Parent Object, made of a side column and PostList
 */

class AssignmentDetail extends React.Component {

	constructor(props) {
		super(props);
		this.expireAssignment = this.expireAssignment.bind(this);
		this.setAssignment = this.setAssignment.bind(this);
		this.state = {
			assignment: this.props.assignment
		}
	}

 	render() {

 		return (
 			<App user={this.props.user}>
 				<TopBar 
 					title={this.state.assignment.title}
 					timeToggle={true}
 					chronToggle={true} 
 					verifiedToggle={true}
 					editable={true} />
 				<AssignmentSidebar 
 					assignment={this.state.assignment}
 					expireAssignment={this.expireAssignment} />
 				<div className="col-sm-8 tall">
	 				<PostList
	 					rank={this.props.user.rank}
	 					purchases={this.props.purchases}
	 					posts={this.props.assignment.posts}
	 					scrollable={false}
	 					editable={false}
	 					size='large' />
				</div>
				<AssignmentEdit 
					assignment={this.state.assignment}
					setAssignment={this.setAssignment}
					user={this.props.user}	/>
 			</App>
 		);

 	}

 	/**
 	 * Sets the stateful assignment
 	 * @param {dictionary} assignment Assignment to update to
 	 */
 	setAssignment(assignment) {
 		this.setState({ assignment: assignment });
 	}

 	/**
 	 * Sets the assignment to expire
 	 * @description Invoked from the on-page button `Expire`
 	 */
 	expireAssignment() {

 		$.post('/scripts/assignment/expire', {
 			id: this.state.assignment._id
 		}, (response) => {
 			console.log(response);

 			// //Do nothing, because of bad response
 			// if(!response.data || response.err)
 			// 	callback([]);
 			// else
 			// 	callback(response.data);

 		});
 	}
}

ReactDOM.render(
  	<AssignmentDetail 
  		user={window.__initialProps__.user} 
  		purchases={window.__initialProps__.purchases} 
  		assignment={window.__initialProps__.assignment}
  		title={window.__initialProps__.title} />,
  	document.getElementById('app')
);