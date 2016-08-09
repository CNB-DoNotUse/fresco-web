import React, { PropTypes } from 'react'
import utils from 'utils'
import _ from 'lodash'

export default class ChangePasswordCard extends React.Component {
    render() {
        return (
            <div className="card">
                <div className="f-card-content full">
                    <div className="header">
                        <span>Change Password</span>
                    </div>
                    
                    <div className="padding">
                        <div className="content-info-input">
                            <input 
                                type="password" 
                                className="form-control floating-label" 
                                placeholder="Current password" />
                            
                            <input 
                                type="password" 
                                className="form-control floating-label" 
                                placeholder="New password" 
                            />
                        </div>
                        
                        <div className="content-info-box">
                            <span>New passwords must:</span>
                            
                            <ul>
                                <li>• Be at least 12 characters long</li>
                                <li>• Contain at least one number</li>
                                <li>• Contain at least one symbol</li>
                                <li>• Be entered the same twice</li>
                            </ul>
                        </div>
                    </div>
                    
                    <button className="btn btn-save">SAVE CHANGES</button>
                </div>
            </div>
        );
    }
}