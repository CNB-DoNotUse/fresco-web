var React = require('react'),
	ReactDOM = require('react-dom'),
	GalleryList = require('./../components/gallery-list.js'),
	TopBar = require('./../components/topbar.js');

/**
 * Highlights Parent Object
 */

var Highlights = React.createClass({

	displayName: 'Highlights',

	render: function(){
		return (
			<div>
				<TopBar title="Highlights" />
				<GalleryList 
					half={false} 
					withList={true} 
					highlighted={true} />
			</div>
		)
	}
});

/**
 * Render Highlights (composed of GalleryList and Navbar) 
 * Half = False, to render at large size instead of half size
 */

ReactDOM.render(
  <Highlights />,
  document.getElementById('page')
);

