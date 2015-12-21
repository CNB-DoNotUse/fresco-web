import React from 'react'


/**
 * Global footer stateless element
 */

export default class Footer extends React.Component {


	constructor(props) {
		super(props);
	}

	render() {

		return(

			<div className="footer dark">
				<div className="middle">
					<span>&copy;2015 Fresco News Inc.</span>
				</div>

				<div className="left">
					<img className="lazy" src="https://d1dw1p6sgigznj.cloudfront.net/images/wordmark-foot.png" />
					<p>
						Fresco News Inc.<br />
						85 Broad St #17.134<br />
						New York, NY 10004
					</p>
				</div>
				
				<div className="right">
					<ul>
						<li><a className="mdi mdi-twitter" href="http://twitter.com/fresconews/" target="_blank"></a></li>
						<li><a className="mdi mdi-facebook-box" href="http://facebook.com/fresconews/" target="_blank"></a></li>
						<li><a className="mdi mdi-instagram" href="http://instagram.com/fresconews/" target="_blank"></a></li>
					</ul>
					<ul>
						<li>TEAM</li>
						<li><a href="https://d1dw1p6sgigznj.cloudfront.net/pdf/press.pdf" target="_blank">PRESS KIT</a></li>
					</ul>
				</div>
			</div>

		);

	}


}
