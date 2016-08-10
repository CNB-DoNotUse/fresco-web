import React from 'react';
import utils from 'utils';
import UserItem from '../global/user-item';

export default class Sidebar extends React.Component {
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
					{assignments.map((assignment, i) => {
						return(
							<li key={i}>
								<a href={"/assignment/" + assignment.id}>{assignment.title}</a>
							</li>
						)
					})}
				</ul>
				
				<h3 className="md-type-button md-type-black-secondary">Stories</h3>
				<ul id="stories" className="md-type-subhead">
					{stories.map((story, i) => {
						return (
							<li key={i}>
								<a href={"/story/" + story.id}>{story.title}</a>
							</li>
						)
					})}
				</ul>
				
				<h3 className="md-type-button md-type-black-secondary">Users</h3>
				<ul id="users" className="meta">
					{users.map((user, i) => {
						return <UserItem key={i} user={user} />
					})}
				</ul>
			</div>
		)
	}
}