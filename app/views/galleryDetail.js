var isNode = require('detect-node'),
	React = require('react'),
	ReactDOM = require('react-dom'),
	TopBar = require('./../components/topbar.js'),
	PostList = require('./../components/post-list.js'),
	GallerySidebar = require('./../components/gallery-sidebar.js'),
	GalleryEdit = require('./../components/editing/gallery-edit.js'),
	App = require('./app.js');

/**
 * Gallery Detail Parent Object, made of a side column and PostList
 */

 var GalleryDetail = React.createClass({

 	displayName: 'GalleryDetail',

 	getDefaultProps: function(){
 		return {
 			gallery : {}
 		};
 	},

 	render: function(){

 		return (
 			<App user={this.props.user}>
 				<TopBar title={this.props.title} />
 				<GallerySidebar gallery={this.props.gallery} />
 				<div className="col-sm-8 tall">
	 				<PostList
	 					rank={this.props.user.rank}
	 					purchases={this.props.purchases}
	 					posts={this.props.gallery.posts}
	 					scrollable={false}
	 					size='small' />
				</div>
				<GalleryEdit 
					gallery={this.props.gallery}
					user={this.props.user}	/>
 			</App>
 		);

 	}

 });

if(isNode){

	module.exports = GalleryDetail;
}
else{

	ReactDOM.render(
	  <GalleryDetail 
	  user={window.__initialProps__.user} 
	  purchases={window.__initialProps__.purchases} 
	  gallery={window.__initialProps__.gallery}
	  title={window.__initialProps__.title} />,
	  document.getElementById('app')
	);

}