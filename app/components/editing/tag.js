var React = require('react'),
	ReactDOM = require('react-dom');

/**
 * Single Tag Element
 * @param {string} text Text of the tag
 * @param {bool} plus if component should show `+` or `-` on hover
 */

var Tag = React.createClass({

	displayName: 'Tag',

	getDefaultProps: function(){

		return{
			text: '',
			plus: false
		}

	},

	render: function(){

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

});

module.exports = Tag;