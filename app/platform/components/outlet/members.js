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
			method: 'GET'
		})    
	    .done((invites) => { 
	    	this.setState({ invites });
	    })    
	    .fail((error) => { 
	    	return $.snackbar({
	    		content: utils.resolveError(error, 'We were unable to retrieve your pending invites!')
	    	});
	    });
	}

	/**
	 * Cancels invite
	 */
	revokeInvite(token) {
		if(this.state.loading) return;

		if(!token) {
			return $.snackbar({
				content : 'We couldn\'t find this invitation!'
			});
		}

		this.setState({ loading: true });

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
	    	$.snackbar({ content: utils.resolveError(error) });
	    })
	    .always(() => {
	    	this.setState({ loading: false });
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
	removeMember(user_id) {
		//Confirm the removal
		alertify.confirm("Are you sure you want remove this user from your outlet?", (e) => {
			if(e) {
				$.ajax({
					url: "/api/outlet/members/remove",
					method: 'post',
					data: { user_id }
				})
				.done((response) => {
					this.props.updateMembers(
						this.props.members.filter((m) => {
							return m.id !== user_id;
						})
					);
				})
				.fail((jqXHR, textStatus, errorThrow) => {
				    $.snackbar({ content: 'We were unable to remove this user from your outlet!' });
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
		//Split by comma and map to remove spaces from all the new strigns
		const emails = outletInviteField.value.split(',').map(e => e.replace(/\s/g, ''));
		//Disable the field until we're done
		outletInviteField.setAttribute('disabled', true);

		if (!emails.length){
			outletInviteField.removeAttribute('disabled');
			
			return $.snackbar({ content:'You must invite at least 1 member!' });
		}

		$.ajax({
			url: "/api/outlet/invite",
			method: 'post',
			contentType: 'application/json',
			data: JSON.stringify({ emails })
		})    
	    .done((response) => { 
			outletInviteField.value = '';

			if(response.result) {
				$.snackbar({
					content : `${response.result.length} ${response.result.length == 1 ? 'invitation' : 'invitations'} successfully sent!`
				});
				this.updatePendingInvites();
			} else {
				$.snackbar({
					content : '0 invites were sent.'
				});
			}
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
					outlet={this.props.outlet}
					invites={this.state.invites}
					removeMember={this.removeMember}
					resendInvite={this.resendInvite}
					revokeInvite={this.revokeInvite} 
				/>

				<div className="footer">
					<input type="text"
						className="outlet-invite"
						ref="outletInviteField"
						placeholder="Invite users by email — luke@death-star.net, hansolo64@death-star.net"
						onKeyDown={this.inviteKeyDown} />
				</div>
			</div>
		)
	}
}

/**
 * Component for rendering members in the member component
 */
class OutletMemberList extends React.Component {
	render () {
		return (
			<div className="outlet-members-container">
				<ul className="outlet-members">
					{this.props.members.map((member, i) => {
						return(
							<MemberListItem 
								member={member}
								removeMember={this.props.removeMember} 
								key={i} />
						);
					})}
					
					{this.props.invites.map((invite, i) => {
						return (
							<MemberListItem 
								pending={true} 
								invite={invite}
								revokeInvite={this.props.revokeInvite}
								resendInvite={this.props.resendInvite}
								key={i} />
						);
					})}
				</ul>
			</div>
		)
	}
}

OutletMemberList.defaultProps = {
	members: [],
	invites: []
}