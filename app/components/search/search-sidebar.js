import React from 'react'

export default class SearchSide extends React.Component {
	render() {
		
		// Build assignment list item
		var assignments = this.props.assignments.map((assignment, i) => {
			return(
				<li key={i}><a href={"/assignment/" + assignment.id}>{assignment.title}</a></li>
			);
		});

		// Build story list item
		var stories = this.props.stories.map((story, i) => {
			return (
				<li key={i}><a href={"/story/" + story.id}>{story.title}</a></li>
			);
		});

		// Build user list item
		var users = this.props.users.map((user, i) => {
			return (
				<li className="meta-user" key={i}>
					<div>
						<a href={"/user/" + user.id}>
							<img
								className="img-circle img-responsive"
								src={user.avatar || 'https://d1dw1p6sgigznj.cloudfront.net/images/user-1-small.png'} />
						</a>
					</div>
					<div>
						<a href={"/user/" + user.id}>
							<span className="md-type-title">{user.firstname} {user.lastname}</span>
						</a>
						
						<span className="md-type-body1">{user.email}</span>

						<span className="md-type-body1">{user.twitter ? '' : 'No Twitter'} • {user.outlet ? 
							<a href={"/outlet/" + user.id}>Outlet</a> : 'No Outlet'}
						</span>
					</div>
				</li>
			);
		});

		return (
			<div className="col-md-4 search-sidebar" onScroll={this.props.scroll}>
				<h3 className="md-type-button md-type-black-secondary">Assignments</h3>
				<ul id="assignments" className="md-type-subhead">
					{assignments}
				</ul>
				
				<h3 className="md-type-button md-type-black-secondary">Stories</h3>
				<ul id="stories" className="md-type-subhead">
					{stories}
				</ul>
				
				<h3 className="md-type-button md-type-black-secondary">Users</h3>
				<ul id="users" className="meta">
					{users}
				</ul>
			</div>
		)
	}
}