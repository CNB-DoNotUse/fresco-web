import React from 'react'
import ReactDOM from 'react-dom'
import App from './app'
import TopBar from './../components/topbar'
import PostList from './../components/global/post-list.js'
import StorySidebar from './../components/storyDetail/story-sidebar'
import StoryEdit from './../components/editing/story-edit.js'
import global from '../../lib/global'

/**
 * Story Detail Parent Object, made of a side column and PostList
 */

class StoryDetail extends React.Component {

	constructor(props) {
		super(props);
		this.loadPosts = this.loadPosts.bind(this);
	}

 	render() {

 		return (
 			<App user={this.props.user}>
 				<TopBar 
 					title={this.props.story.title}
					editable={true}
 					timeToggle={true}
 					chronToggle={true} />
 				<StorySidebar story={this.props.story} />
 				<div className="col-sm-8 tall">
	 				<PostList
	 					rank={this.props.user.rank}
	 					purchases={this.props.purchases}
	 					loadPosts={this.loadPosts}
	 					scrollable={true}
	 					editable={false}
	 					size='large' />
				</div>
				<StoryEdit 
					story={this.props.story}
					user={this.props.user}	/>
 			</App>
 		);

 	}


 	//Returns array of posts with offset and callback, used in child PostList
 	loadPosts(passedOffset, callback) {

 		var params = {
				id: this.props.story._id,
				limit: 10,
				offset: passedOffset,
			};

 		$.ajax({
 			url:  '/api/story/posts',
 			type: 'GET',
 			data: params,
 			dataType: 'json',
 			success: (response, status, xhr) => {

 				//Do nothing, because of bad response
 				if(!response.data || response.err)
 					callback([]);
 				else
 					callback(response.data);

 			},
 			error: (xhr, status, error) => {
 				$.snackbar({content: resolveError(error)});
 			}

 		});

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