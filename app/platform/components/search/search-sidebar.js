import React from 'react';
import utils from 'utils';

export default class SearchSidebar extends React.Component {
	render() {
		const { 
			users, 
			assignments, 
			stories
		} = this.props;

		return (
			<div className="col-md-4 search-sidebar" onScroll={this.props.scroll}>
				<h3 className="md-type-button md-type-black-secondary">Assignments</h3>
				<ul id="assignments" className="md-type-subhead">
					{this.props.assignments.map((assignment, i) => {
						return(
							<li key={i}><a href={"/assignment/" + assignment.id}>{assignment.title}</a></li>
						)
					})}
				</ul>
				
				<h3 className="md-type-button md-type-black-secondary">Stories</h3>
				<ul id="stories" className="md-type-subhead">
					{this.props.stories.map((story, i) => {
						return (
							<li key={i}><a href={"/story/" + story.id}>{story.title}</a></li>
						)
					})}
				</ul>
				
				<h3 className="md-type-button md-type-black-secondary">Users</h3>
				<ul id="users" className="meta">
					{this.props.users.map((user, i) => {
						return (
							<li className="meta-user" key={i}>
								<div>
									<a href={"/user/" + user.id}>
										<img
											className="img-circle img-responsive"
											src={user.avatar || utils.defaultSmallAvatar} />
									</a>
								</div>
								<div>
									<a href={"/user/" + user.id}>
										<span className="md-type-title">{user.full_name}</span>
									</a>
									
									<span className="md-type-body1">{user.email}</span>

									<span className="md-type-body1">{user.username}</span>

									<span className="md-type-body1">{user.twitter_handle || 'No Twitter'} • {user.outlet ? 
										<a href={"/outlet/" + user.id}>Outlet</a> : 'No Outlet'}
									</span>
								</div>
							</li>
						)
					})}
				</ul>
			</div>
		)
	}
}