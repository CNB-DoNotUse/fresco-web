import React from 'react'

export default class SearchSide extends React.Component {
	render() {

		var assignments = [],
			stories = [],
			users = [];
		
		// Build assignment list item
		this.props.assignments.map((assignment, i) => {
			assignments.push(
				<li key={i}><a href={"/assignment/" + assignment._id}>{assignment.title}</a></li>
			);
		});

		// Build story list item
		this.props.stories.map((story, i) => {
			stories.push(
				<li key={i}><a href={"/story/" + story._id}>{story.title}</a></li>
			);
		});

		// Build user list item
		this.props.users.map((user, i) => {
			users.push(
				<li className="meta-user" key={i}>
					<div>
						<a href="/user/5643aec78a5565ec64df0d71">
							<img
								className="img-circle img-responsive"
								src={user.avatar || 'https://d1dw1p6sgigznj.cloudfront.net/images/user-1-small.png'} />
						</a>
					</div>
					<div>
						<a href="/user/5643aec78a5565ec64df0d71">
							<span className="md-type-title">{user.firstname} {user.lastname}</span>
						</a>
						<span className="md-type-body1">{user.twitter ? '' : 'No Twitter'} • {user.outlet ? <a href={"/outlet/" + user.outlet}>Outlet</a> : 'No Outlet'}</span>
					</div>
				</li>
			);
		});

		return (
			<div className="col-md-4">
				<h3 className="md-type-button md-type-black-secondary">Assignments</h3>
				<ul id="assignments" className="md-type-subhead">{assignments}</ul>
				<h3 className="md-type-button md-type-black-secondary">Stories</h3>
				<ul id="stories" className="md-type-subhead">{stories}</ul>
				<h3 className="md-type-button md-type-black-secondary">Users</h3>
				<ul id="users" className="meta">{users}</ul>
			</div>
		)
	}
}