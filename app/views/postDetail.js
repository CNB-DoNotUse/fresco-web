var isNode = require('detect-node'),
	React = require('react'),
	ReactDOM = require('react-dom'),
	TopBar = require('./../components/topbar.js'),
	PostInfo = require('./../components/post-info.js'),
	PostRelated = require('./../components/post-related.js'),
	PostDetailImage = require('./../components/post-detail-image.js'),
	GalleryEdit = require('./../components/editing/gallery-edit.js'),
	App = require('./app.js');

/**
 * Gallery Detail Parent Object, made of a side column and PostList
 */

 var PostDetail = React.createClass({

 	displayName: 'PostDetail',

 	getDefaultProps: function(){
 		return {
 			gallery : {}
 		};
 	},

 	render: function(){

 		return (
 			<App user={this.props.user}>
 				<TopBar 
 					title={this.props.title}
 					editable={true}
				/>
 				<div className="content">
 					<div className="row">
 						<div className="main">
 							<PostDetailImage 
 								post={this.props.post} 
 								user={this.props.user}
 								purchases={this.props.purchases} />
 							<PostInfo 
 								post={this.props.post}
 								gallery={this.props.gallery}
 								verifier={this.props.verifier} />
 						</div>
 					</div>
 					<PostRelated gallery={this.props.gallery} />
 				</div>
 				<GalleryEdit 
 					gallery={this.props.gallery} 
 					user={this.props.user}
 					/>
 			</App>
 		);
 	}

 });

if(isNode){

	module.exports = PostDetail;
}
else{

	//Make sure to remove this
	ReactDOM.render(
	  <PostDetail 
		  user={window.__initialProps__.user} 
		  purchases={window.__initialProps__.purchases} 
		  gallery={window.__initialProps__.gallery}
		  post={window.__initialProps__.post}
		  title={window.__initialProps__.title} />,
	  document.getElementById('app')
	);

}