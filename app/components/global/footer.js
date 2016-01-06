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

			<div className="footer" id="_footer">
				<div className="middle">
					<ul>
						<li>&copy;2015 Fresco News Inc</li>
						<li><a href="/legal">&bull; Terms of Service</a></li>
						<li><a href="/legal">&bull; Privacy Policy</a></li>
					</ul>
				</div>

				<div className="left">
					<span className="icon-fresco"></span>
					<p>Fresco News Inc.</p>
					<p>85 Broad St #17.134</p>
					<p>New York, NY 10004</p>
				</div>
				
				<div className="right">
					<ul>
						<li><a className="mdi mdi-twitter twitter" href="http://twitter.com/fresconews/" target="_blank"></a></li>
						<li><a className="mdi mdi-facebook-box facebook" href="http://facebook.com/fresconews/" target="_blank"></a></li>
						<li><a className="mdi mdi-instagram instagram" href="http://instagram.com/fresconews/" target="_blank"></a></li>
						<li><a className="mdi mdi-tumblr tumblr" href="http://fresconews.tumblr.com/" target="_blank"></a></li>
					</ul>
					<ul className="links" id="footer-actions">
						<li><a href="/team">TEAM</a></li>
						<li><a href="/press">PRESS</a></li>
						<li><a href="/contact">CONTACT</a></li>
					</ul>
				</div>
			</div>

		);

	}


}
