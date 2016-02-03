import React from 'react'
import global from '../../../lib/global'

export default class OutletMembers extends React.Component {

	constructor(props) {
		super(props);

		this.removeMember = this.removeMember.bind(this);
		this.inviteKeyDown = this.inviteKeyDown.bind(this);
	}

	/**
	 * Removes a member from the outlet
	 */
	removeMember(id) {

		var self = this,
			members = this.props.members;

		//Confirm the purchase
		alertify.confirm("Are you sure you want remove this user from your outlet?", (e) => {

			if(e) {
				$.ajax({
					url: "/api/outlet/user/remove",
					method: 'post',
					data: {
						user: id
					},
					success: function(result, status, xhr){
						if (result.err)
							return this.error(null, null, result.err);

						var members = self.props.members.filter((member) => {
							return member._id !== id;
						});

						self.props.updateMembers(members);
					},
					error: (xhr, status, error) => {
						$.snackbar({content: global.resolveError(error)});
					}
				});
			}
		});
	}

	/**
	 * Event lister for email invite field
	 */
	inviteKeyDown(e) {
		if(e.keyCode != 13)
			return;

		var addresses = this.refs['outlet-invite'].value.split(' '),
			self = this;

		this.refs['outlet-invite'].setAttribute('disabled', true);

		if (addresses == '' || (addresses.length == 1 && addresses[0].split() == '')){
			$.snackbar({content:'You must invite at least 1 member!'});
			this.refs['outlet-invite'].removeAttribute('disabled');
			return false;
		}

		$.ajax({
			url: "/api/outlet/invite",
			method: 'post',
			contentType: "application/json",
			data: JSON.stringify({
				emails: addresses,
				id: this.props.outlet._id
			}),
			dataType: 'json',
			success: function(result, status, xhr){
				self.refs['outlet-invite'].removeAttribute('disabled');

				if (result.err)
					return this.error(null, null, result.err);

				self.refs['outlet-invite'].value = '';

				$.snackbar({
					content: (addresses.length == 1 ? 'Invitation' : 'Invitations') + ' successfully sent!'
				});
			},
			error: (xhr, status, error) => {
				$.snackbar({content: global.resolveError(error)});
			}
		});
	}

	render () {
		return (
			<div className="card settings-outlet-members">
				<div className="header">
					<span className="title">USERS</span>
				</div>

				<OutletMemberList
					members={this.props.members}
					removeMember={this.removeMember} />

				<div className="footer">
					<input type="text"
						className="outlet-invite"
						ref="outlet-invite"
						placeholder="Invite users by email"
						onKeyDown={this.inviteKeyDown} />
				</div>
			</div>
		)
	}
}

class OutletMemberList extends React.Component {
	render () {

		var members = this.props.members.map((member, i) => {
			var phone = member.phone ? ' • ' + member.phone : '';

			return(
				<li className="member" key={i}>
					<div className="info">
						<p className="name">{member.firstname + ' ' + member.lastname}</p>
						<span className="email">{member.email}</span>
						<span className="phone">{phone}</span>
					</div>

					<span
						onClick={this.props.removeMember.bind(null, member._id)}
						className="delete-member mdi mdi-delete"></span>
				</li>
			);
		});

		if(members.length == 0){
			return (
				<div className="outlet-members-container">
					<h3 className="empty-title">There are currently no members in your outlet!</h3>
				</div>
			)
		}

		return (
			<div className="outlet-members-container">
				<ul className="outlet-members">
					{members}
				</ul>
			</div>
		)
	}
}
