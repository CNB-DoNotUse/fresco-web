import React from 'react'
import Sidebar from '../components/global/sidebar'
import global from '../../lib/global'

/**
 * Gallery Detail Parent Object
 */

export default class App extends React.Component {

	componentDidMount() {

		$.material.init();
		this.state = {
			verifiedToggle: true,
			sort: 'capture'
		}
	}

	onVerifiedToggled(toggled) {
		this.setState({
			verifiedToggle: toggled
		});
	}

	updateSort(sort) {
		this.setState({
			sort: sort
		});
	}

	render() {
		
		return (
			<div>
				<div className="dim toggle-drawer toggler" id="_toggler"></div>
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