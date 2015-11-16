var isNode = require('detect-node'),
	React = require('react'),
	ReactDOM = require('react-dom'),
	App = require('./app.js'),
	GalleryList = require('./../components/gallery-list.js'),
	TopBar = require('./../components/topbar.js');
	
/**
 * Highlights Parent Object (composed of GalleryList and Navbar) 
 * Half = False, to render at large size instead of half size
 */

var Highlights = React.createClass({

	displayName: 'Highlights',

	render: function(){
		return (
			<App user={this.props.user}>
				<TopBar title="Highlights" />
				<GalleryList 
					withList={true} 
					highlighted={true} />
			</App>
		)
	}

});

if(isNode)
	module.exports = Highlights;
else
	ReactDOM.render(
	  <Highlights user={window.__initialProps__.user} />,
	  document.getElementById('app')
	);