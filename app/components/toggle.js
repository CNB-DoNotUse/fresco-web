var React = require('react'),
	ReactDOM = require('react-dom');

/**
 * Toggle Element
 */

var Toggle = React.createClass({

	displayName: 'Toggle',

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

			<button className="toggle-drop md-type-subhead time-display-filter-button" ref="time_toggle_button">
				<span className="time-display-filter-text" ref="currentTimeFilter">Relative</span><span className="mdi mdi-menu-down icon"></span>
			</button>
			<div className="drop-menu panel panel-default">
				<div className="toggle-drop toggler md-type-subhead">
					<span className="time-display-filter-text" ref="currentTimeFilter">Relative</span>
					<span className="mdi mdi-menu-up icon pull-right"></span>
				</div>
				<div className="drop-body">
					<ul className="md-type-subhead">
						<li className="time-display-filter-type active" data-filter-type="relative" onClick={this.clicked}>Relative</li>
						<li className="time-display-filter-type" data-filter-type="absolute" onClick={this.clicked}>Absolute</li>
					</ul>
				</div>
			</div>

		);

	}

});

module.exports = Tag;