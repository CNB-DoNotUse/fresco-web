import React from 'react'

export default class QuickSupport extends React.Component {
	render() {
		return (
			<div className="quick-support">
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