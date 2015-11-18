var isNode = require('detect-node'),
	React = require('react'),
	ReactDOM = require('react-dom'),
	TopBar = require('./../components/topbar.js'),
	PostList = require('./../components/post-list.js'),
	StorySidebar = require('./../components/story-sidebar.js'),
	StoryEdit = require('./../components/editing/story-edit.js'),
	App = require('./app.js');

/**
 * Story Detail Parent Object, made of a side column and PostList
 */

 var StoryDetail = React.createClass({

 	displayName: 'StoryDetail',

 	getDefaultProps: function(){
 		return {
 			story : {}
 		};
 	},

 	render: function(){

 		return (
 			<App user={this.props.user}>
 				<TopBar 
 					title={this.props.story.title}
 					timeToggle={true}
 					chronToggle={true} />
 				<StorySidebar Story={this.props.story} />
 				<div className="col-sm-8 tall">
	 				<Post
	 					rank={this.props.user.rank}
	 					purchases={this.props.purchases}
	 					posts={this.props.Story.posts}
	 					scrollable={false}
	 					editable={false}
	 					size='small' />
				</div>
				{/*<StoryEdit 
					Story={this.props.Story}
					user={this.props.user}	/> */}
 			</App>
 		);

 	}

 });

if(isNode){

	module.exports = StoryDetail;
}
else{

	ReactDOM.render(
	  	<StoryDetail 
	  		user={window.__initialProps__.user} 
	  		purchases={window.__initialProps__.purchases} 
	  		story={window.__initialProps__.story}
	  		title={window.__initialProps__.title} />,
	  	document.getElementById('app')
	);

}