var isNode = require('detect-node'),
	React = require('react'),
	ReactDOM = require('react-dom'),
	PostList = require('./../components/post-list.js'),
	TopBar = require('./../components/topbar.js'),
	App = require('./app.js');

/**
 * Galleries Parent Object (composed of GalleryList and Navbar) 
 * Half = False, to render at large size instead of half size
 */

var Videos = React.createClass({

	displayName: 'Photos',

	render: function(){
		return (
			<App>
				<TopBar title="Photos" />
				<PostList size='small' />
			</App>
		)
	}

});

if(isNode){

	module.exports = function(){
		ReactDOM.renderComponentToString(<Photos />);
	}

}
else{
	ReactDOM.render(
	  <Videos />,
	  document.getElementById('app')
	);
}