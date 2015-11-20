import React from 'react'

/**
 * Single Tag Element
 * @param {string} text Text of the tag
 * @param {bool} plus if component should show `+` or `-` on hover
 */

export default class Tag extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {

		var editClass = 'mdi-minus'

		if(this.props.plus) editClass = 'mdi-plus';

		return(

			<li className="chip" onClick={this.props.onClick}>
				<div className="chip">
					<div className="icon">
						<span className={'mdi ' + editClass + ' icon md-type-subhead'}></span>
					</div>
					<span className="chip md-type-body1 tag">{this.props.text}</span>
				</div>
			</li>

		);

	}

}

Tag.defaultProps = {
	text: '',
	plus: false
}