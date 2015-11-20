import React from 'react'
import Sidebar from '../components/sidebar'
import global from '../../lib/global'

/**
 * Gallery Detail Parent Object
 */

export default class App extends React.Component {
	render() {
		return (
			<div>
				<div className="dim toggle-drawer toggler"></div>
				<div className="container-fluid">
					<Sidebar user={this.props.user} />
					<div className="col-md-12 col-lg-10">
						{this.props.children}
					</div>
				</div>
			</div>
		);
	}
}