import React from 'react'
import OutletSidebar from './outlet-sidebar'
import global from '../../../lib/global'

/** //

Description : Outlet screen for when outlet has not yet been verified

// **/

/**
 * @description Displays a simple message to the user of an unverified outlet
 */
export default class OutletBodyDemo extends React.Component {
    render () {
        var outlet = this.props.outlet;

        return (
            <div className="container-fluid tabs">
				<div className="tab tab-vault toggled">
					<div className="container-fluid fat">
						<div className="profile visible-xs"></div>

						<OutletSidebar outlet={outlet} />

						<div className="col-sm-8 tall">
                            <div className="grid">
                                <h1>This outlet is currently in demo mode.</h1>
                                <p>
                                    Purchases and downloads are disabled until we verify your outlet. We'll be in contact with {outlet.owner.firstname} {outlet.owner.lastname}.
                                </p>
                            </div>
						</div>
					</div>
				</div>
			</div>
        )
    }
}
