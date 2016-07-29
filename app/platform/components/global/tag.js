import React from 'react'

/**
 * Single Tag element
 */
export default class Tag extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {
		const { plus } = this.props;
		
		return(
			<li className="chip" onClick={this.props.onClick}>
				<div className="chip">
					<div className="icon">
						<span 
							className={`mdi ${plus ? 'mdi-plus' : 'mdi-minus'} icon md-type-subhead`}>
						</span>
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