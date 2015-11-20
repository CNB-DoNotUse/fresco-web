import React from 'react'
import ReactDOM from 'react-dom'
import TopBar from './../components/topbar.js'
import PostList from './../components/post-list.js'
import StorySidebar from './../components/story-sidebar.js'
import StoryEdit from './../components/editing/story-edit.js'
import App from './app.js'

/**
 * Story Detail Parent Object, made of a side column and PostList
 */

class StoryDetail extends React.Component {

	constructor(props) {
		super(props);
	}

 	render() {

 		return (
 			<App user={this.props.user}>
 				<TopBar 
 					title={this.props.story.title}
 					timeToggle={true}
 					chronToggle={true} />
 				<StorySidebar story={this.props.story} />
 				<div className="col-sm-8 tall">
	 				<PostList
	 					rank={this.props.user.rank}
	 					purchases={this.props.purchases}
	 					posts={this.props.story.posts}
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

}

StoryDetail.defaultProps = {
	story : {}
}

ReactDOM.render(
  	<StoryDetail 
  		user={window.__initialProps__.user} 
  		purchases={window.__initialProps__.purchases} 
  		story={window.__initialProps__.story}
  		title={window.__initialProps__.title} />,
  	document.getElementById('app')
);