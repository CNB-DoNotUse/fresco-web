import React from 'react'
import global from '../../../lib/global'

export default class OutletMembers extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			pendingInvites: []
		}

		this.getPendingInvites = this.getPendingInvites.bind(this);
		this.removeMember = this.removeMember.bind(this);
		this.resendInvite = this.resendInvite.bind(this);
		this.revokeInvite = this.revokeInvite.bind(this);
		this.inviteKeyDown = this.inviteKeyDown.bind(this);
	}

	componentDidMount() {
	 	this.getPendingInvites();     
	}

	/**
	 * Retrieves pending invites for the outlet
	 */
	getPendingInvites() {
		var self = this;

		$.ajax({
			url: "/api/outlet/invite/list",
			method: 'get',
			success: function(response, status, xhr) {
				if (response.err)
					return this.error(null, null, response.err);

				self.setState({
					pendingInvites: response.data
				});
			},
			error: (xhr, status, error) => {
				$.snackbar({content: global.resolveError(error, 'We were unable to retrieve your pending invites!')});
			}
		});
	}

	/**
	 * Cancels invite 
	 */
	revokeInvite(token) {
		if(!token) {
			return $.snackbar({
				content : 'We couldn\'t find this invitation!'
			});
		}

		var self = this;

		$.ajax({
			url: "/api/outlet/invite/decline",
			method: 'post',
			data: {
				token: token
			},
			success: function(response, status, xhr){
				if (response.err)
					return this.error(null, null, response.err);

				self.getPendingInvites();

				$.snackbar({ content: 'This invitation has been successfully canceled!'});
			},
			error: (xhr, status, error) => {
				$.snackbar({content: global.resolveError(error)});
			}
		});
	}

	/**
	 * Resends invite to user
	 */
	resendInvite(token) {
		if(!token) {
			return $.snackbar({
				content : 'We couldn\'t find this invitation!'
			});
		}

		var self = this;

		$.ajax({
			url: "/api/outlet/invite/resend",
			method: 'post',
			data: {
				token: token
			},
			success: function(response, status, xhr){
				if (response.err)
					return this.error(null, null, response.err);

				$.snackbar({ content: 'This invitation has been successfully resent!'});
			},
			error: (xhr, status, error) => {
				$.snackbar({content: global.resolveError(error)});
			}
		});
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
				self.getPendingInvites();

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
					pendingInvites={this.state.pendingInvites}
					removeMember={this.removeMember}
					resendInvite={this.resendInvite}
					revokeInvite={this.revokeInvite} />

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

		var invites = this.props.pendingInvites.map((invite, i) => {
			return (
				<li className="member" key={i}>
					<div className="pending-info">
						<span className="email">{invite.email}</span>
						<span className="subtext">Pending Invitation</span>
					</div>

					<span 
						className="cancel"
						onClick={this.props.revokeInvite.bind(null, invite.token)}>CANCEL</span>
					<span 
						className="resend" 
						onClick={this.props.resendInvite.bind(null, invite.token)}>RESEND</span>
				</li>
			);
		});

		if(members.length == 0 && invites.length == 0){
			return (
				<div className="outlet-members-container"></div>
			)
		}

		return (
			<div className="outlet-members-container">
				<ul className="outlet-members">
					{members}
					{invites}
				</ul>
			</div>
		)
	}
}
