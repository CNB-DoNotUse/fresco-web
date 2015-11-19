var isNode = require('detect-node'),
	React = require('react'),
	ReactDOM = require('react-dom'),
	GalleryList = require('./../components/gallery-list.js'),
	TopBar = require('./../components/topbar.js'),
	App = require('./app.js');

/**
 * Galleries Parent Object (composed of GalleryList and Navbar) 
 * Half = False, to render at large size instead of half size
 */

var Galleries = React.createClass({

	displayName: 'Galleries',

	render: function(){
		return (
			<App user={this.props.user}>
				<TopBar title="Galleries" />
				<GalleryList 
					withList={false}
					highlighted={false} />
			</App>
		)
	}

});

if(isNode){
	module.exports = Galleries;
}
else{
	ReactDOM.render(
	  <Galleries user={window.__initialProps__.user}/>,
	  document.getElementById('app')
	);
}
