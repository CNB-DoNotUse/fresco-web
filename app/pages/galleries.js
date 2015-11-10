var React = require('react'),
	ReactDOM = require('react-dom'),
	GalleryList = require('./../components/gallery-list.js'),
	TopBar = require('./../components/topbar.js');

/**
 * Highlights Parent Object
 */

var Galleries = React.createClass({

	displayName: 'Galleries',

	render: function(){
		return (
			<div>
				<TopBar title="Galleries" />
				<GalleryList half={true} withList={false} />
			</div>
		)
	}
});

/**
 * Render Highlights (composed of GalleryList and Navbar) 
 * Half = False, to render at large size instead of half size
 */

ReactDOM.render(
  <Galleries />,
  document.getElementById('page')
);

