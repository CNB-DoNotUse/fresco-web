var isNode = require('detect-node'),
	React = require('react'),
	ReactDOM = require('react-dom'),
    Sidebar = require('../components/sidebar.js');


/**
 * Gallery Detail Parent Object
 */

var App = React.createClass({

	displayName: 'App',

	render: function(){

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
		)
	}
	
});


module.exports = App;