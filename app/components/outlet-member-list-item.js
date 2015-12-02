import React from 'react'

export default class OutletMemberListItem extends React.Component {
	render () {
		var member = this.props.member;
		return (
			<li>
				<div className="member-info">
					<div>{member.name}</div>
					<div>{member.email}</div>
					<div>{member.phone}</div>
				</div>
				<a className="delete-member" 
					style={{marginLeft: '300px'}}
					onClick={this.props.remove.bind(null, member._id)}>
					<span className="mdi mdi-delete"></span>
				</a>
			</li>
		)
	}
}