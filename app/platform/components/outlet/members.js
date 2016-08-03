import React from 'react'
import utils from 'utils'
import MemberListItem from './member-list-item';

export default class OutletMembers extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			invites: []
		}

		this.updatePendingInvites = this.updatePendingInvites.bind(this);
		this.removeMember = this.removeMember.bind(this);
		this.resendInvite = this.resendInvite.bind(this);
		this.revokeInvite = this.revokeInvite.bind(this);
		this.inviteKeyDown = this.inviteKeyDown.bind(this);
	}

	componentDidMount() {
	 	this.updatePendingInvites();
	}

	/**
	 * Retrieves pending invites for the outlet
	 */
	updatePendingInvites() {
		$.ajax({
			url: "/api/outlet/invite/list",
			method: 'get'
		})    
	    .done((response) => { 
	    	this.setState({
	    		invites: response
	    	})
	    })    
	    .fail((error) => { 
	    	return $.snackbar({
	    		content: utils.resolveError(error, 'We were unable to retrieve your pending invites!')
	    	});
	    })    
	    .always(() => { 

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

		$.ajax({
			url: "/api/outlet/invite/revoke",
			method: 'post',
			data: { token }
		})    
	    .done((response) => { 
	    	this.updatePendingInvites();

			$.snackbar({ content: 'This invitation has been successfully canceled!'});
	    })    
	    .fail(() => { 
	    	return $.snackbar({ content: utils.resolveError(error) });
	    })    
	    .always(() => { 

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

		$.ajax({
			url: "/api/outlet/invite/resend",
			method: 'post',
			data: { token }
		})    
	    .done((response) => { 
			$.snackbar({ content: 'This invitation has been successfully resent!'});
	    })    
	    .fail((error) => { 
	    	return $.snackbar({ content: utils.resolveError(error, 'We couldn\'t resend this invite!') });
	    });
	}

	/**
	 * Removes a member from the outlet
	 */
	removeMember(user) {
		const { members } = this.props;

		//Confirm the removal
		alertify.confirm("Are you sure you want remove this user from your outlet?", (e) => {
			if(e) {
				$.ajax({
					url: "/api/outlet/user/remove",
					method: 'post',
					data: { user }
				})
				.done((response) => {
					self.props.updateMembers(
						_.filter(members, (m) => {
							m.id !== user;
						})
					);
				})
				.fail((jqXHR, textStatus, errorThrow) => {
				    $.snackbar({ content: 'Unable to remove member' });
				});
			}
		});
	}

	/**
	 * Event lister for email invite field, sends emails by reading the input field
	 */
	inviteKeyDown(e) {
		if(e.keyCode != 13) return;

		const { outletInviteField } = this.refs;
		const emails = outletInviteField.value.split(' ');

		outletInviteField.setAttribute('disabled', true);

		if (emails == '' || (emails.length == 1 && emails[0].split() == '')){
			outletInviteField.removeAttribute('disabled');
			
			return $.snackbar({content:'You must invite at least 1 member!'});
		}

		$.ajax({
			url: "/api/outlet/invite",
			method: 'post',
			contentType: 'application/json',
			data: JSON.stringify({ emails })
		})    
	    .done((response) => { 
			outletInviteField.value = '';

			$.snackbar({
				content : `${response.invitesSent} ${response.invitesSent == 1 ? 'invitation' : 'invitations'} successfully sent!`
			});
			
			this.updatePendingInvites();
	    })    
	    .fail((error) => { 
	    	return $.snackbar({ content: utils.resolveError(error) });
	    })
	    .always(() => {
			outletInviteField.removeAttribute('disabled');
	    })
	}

	render () {
		return (
			<div className="card settings-outlet-members">
				<div className="header">
					<span className="title">USERS</span>
				</div>

				<OutletMemberList
					members={this.props.members}
					invites={this.state.invites}
					removeMember={this.removeMember}
					resendInvite={this.resendInvite}
					revokeInvite={this.revokeInvite} 
				/>

				<div className="footer">
					<input type="text"
						className="outlet-invite"
						ref="outletInviteField"
						placeholder="Invite users by email"
						onKeyDown={this.inviteKeyDown} />
				</div>
			</div>
		)
	}
}

class OutletMemberList extends React.Component {
	render () {
		const members = this.props.members.map((member, i) => {
			return(
				<MemberListItem 
					member={member}
					removeMember={this.props.removeMember} 
					key={i} />
			);
		});

		const invites = this.props.invites.map((invite, i) => {
			return (
				<MemberListItem 
					pending={true} 
					invite={invite}
					revokeInvite={this.props.revokeInvite}
					resendInvite={this.props.resendInvite}
					key={i} />
			);
		});

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
