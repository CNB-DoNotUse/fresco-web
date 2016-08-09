import React, { PropTypes } from 'react'
import utils from 'utils'
import _ from 'lodash'

export default class ChangePasswordCard extends React.Component {
    render() {
        return (
            <div class="dialog">
                <div class="header">
                    <h2>Enter your password</h2>
                </div>

                <div class="body">
                    <input 
                        type="text" 
                        ref="phone" 
                        maxLength={15}
                        placeholder="Phone number" 
                        defaultValue={user.phone} />
                </div>

                <div class="footer">

                </div>
            </div>
        );
    }
}