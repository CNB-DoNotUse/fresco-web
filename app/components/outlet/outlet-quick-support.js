import React from 'react'

export default class OutletQuickSupport extends React.Component {
	render() {
		return (
			<div className="outlet-quick-support">
				<h3>QUICK SUPPORT</h3>
				<ul>
					<li>
						<span className="mdi mdi-email"></span>
						<a href="mailto:support@fresconews.com">Email us</a>
					</li>
				</ul>
			</div>
		);
	}
}