import React, { PropTypes } from 'react';
import UserItem from '../global/user-item';

/**
 * AcceptedUser
 *
 * @param {Object} {user} User object from api containing user info such as name and email
 * @returns {JSX} Accepted user component
 */
class AcceptedUser extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            changed:false
        };
    }

    componentWillReceiveProps(nextProps) {
        if(this.props.user.distance !== nextProps.user.distance) {
            this.setState({
                changed: true
            });

            setTimeout(() => {
                //Remove class after 1.5s
                this.setState({
                    changed: false
                })
            }, 1500)
        }
    }

    render() {
        const { user } = this.props;
        const { changed } = this.state;

        return (
            <div className={`assignment__accepted-user ${changed ? 'changed' : ''}`}>
                <UserItem user={user} />
                <span className="mdi mdi-map-marker"></span>

                <span className="assignment__accepted-location">
                    <span className="assignment__accepted-distance">{user.distance.toFixed(2)}</span>
                    <span> miles away</span>
                </span>
            </div>
        )
    }
}

AcceptedUser.propTypes = {
    user: PropTypes.object.isRequired,
};

export default AcceptedUser;
