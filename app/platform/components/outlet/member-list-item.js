import React, { PropTypes, Component } from 'react'
import utils from 'utils'

export default class MemberListItem extends Component {
    render () {
        const { 
            member, 
            removeMember, 
            revokeInvite, 
            resendInvite, 
            pending, 
            invite 
        } = this.props;

        console.log(this.props);

        console.log(invite);

        if(pending) {
            return (
                <li className="member">
                    <div className="pending-info">
                        <span className="email">{invite.email}</span>
                        <span className="subtext">Pending Invitation</span>
                    </div>

                    <span
                        className="cancel"
                        onClick={revokeInvite.bind(null, invite.token)}>CANCEL
                    </span>
                    
                    <span
                        className="resend"
                        onClick={resendInvite.bind(null, invite.token)}>RESEND
                    </span>
                </li>
            );
        } else {
            return (
                <li className="member" key={i}>
                    <div className="info">
                        <p className="name">{member.full_name || member.username}</p>
                        
                        <span className="email">{member.email}</span>
                        
                        <span className="phone">
                            {member.phone ? ' • ' + member.phone : ''}
                        </span>
                    </div>

                    <span
                        onClick={removeMember.bind(null, member.id)}
                        className="delete-member mdi mdi-delete">
                    </span>
                </li>
            );
        }
    }
}

MemberListItem.propTypes = {
    member: PropTypes.object,
    removeMember: PropTypes.func,
    revokeInvite: PropTypes.func,
    resendInvite: PropTypes.func,
    pending: PropTypes.bool,
    invite: PropTypes.object
};