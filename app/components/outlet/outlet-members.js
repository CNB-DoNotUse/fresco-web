import React from 'react'
import OutletMemberListItem from './outlet-member-list-item'

export default class OutletMembers extends React.Component {

	constructor(props) {
		super(props);
		this.removeMember = this.removeMember.bind(this);
		this.handleInviteInputKeyDown = this.handleInviteInputKeyDown.bind(this);
	}

	removeMember(id) {
		$.ajax({
			url: "/scripts/outlet/user/remove",
			method: 'post',
			data: {
				user: id
			},
			success: (result, status, xhr) => {
				if (result.err)
					return this.error(null, null, result.err);
				location.reload();
			},
			error: (xhr, status, error) => {
				$.snackbar({content: resolveError(error)});
			},
			complete: () => {
				_this.prop('disabled', false);
			}
		});
	}

	handleInviteInputKeyDown(e) {
		if(e.keyCode != 13) return;
		var addresses = this.refs['outlet-invite'].value.split(' ');

		if (addresses == '' || (addresses.length == 1 && addresses[0].split() == '')){
			e.preventDefault();
			$.snackbar({content:'Must invite at least 1 member'});
			return false;
		}

		$.ajax({
			url: "/scripts/outlet/invite",
			method: 'post',
			contentType: "application/json",
			data: JSON.stringify({
				emails: addresses
			}),
			dataType: 'json',
			success: (result, status, xhr) => {
				if (result.err)
					return this.error(null, null, result.err);

				this.refs['outlet-invite'].value = '';

				$.snackbar({content: (addresses.length == 1 ? 'Invitation' : 'Invitations') + ' successfully sent!'});
			},
			error: (xhr, status, error) => {
				$.snackbar({content: resolveError(error)});
			}
		});
	}

	render () {

		var members = [];

		this.props.members.map((member, i) => {
			members.push(
				<OutletMemberListItem member={member} remove={this.removeMember} key={i} />
			);
		});	

		return (
			<div className="card panel card-outlet-members">
				<div className="header">
					<span className="title">USERS</span>
				</div>
				<div className="outlet-members-container">
					<ul className="outlet-members">
						{members}
					</ul>
				</div>
				<div className="footer">
					<input type="text"
					style={{width: '100%'}}
					className="outlet-invite"
					ref="outlet-invite"
					placeholder="Invite users by email" 
					onKeyDown={this.handleInviteInputKeyDown} />
				</div>
			</div>
		)
	}
}