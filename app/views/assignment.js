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

class AssignmentDetail extends React.Component {

	constructor(props) {
		super(props);
		this.loadPosts = this.loadPosts.bind(this);
	}

 	render() {

 		return (
 			<App user={this.props.user}>
 				<TopBar 
 					title={this.props.story.title}
 					timeToggle={true}
 					chronToggle={true} 
 					verifiedToggle={true} />
 				<AssignmentSidebar assignment={this.props.assignment} />
 				<div className="col-sm-8 tall">
	 				<PostList
	 					rank={this.props.user.rank}
	 					purchases={this.props.purchases}
	 					loadPosts={this.loadPosts}
	 					scrollable={false}
	 					editable={false}
	 					size='large' />
				</div>
				{/*<StoryEdit 
					Story={this.props.Story}
					user={this.props.user}	/> */}
 			</App>
 		);

 	}


 	//Returns array of posts with offset and callback, used in child PostList
 	loadPosts (passedOffset, callback) {

 		var endpoint = '/v1/story/posts',
 				params = {
 					id: this.props.story._id,
 					limit: 10,
 					offset: passedOffset,
 				};

 		$.ajax({
 			url:  API_URL + endpoint,
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
  	<AssignmentDetail 
  		user={window.__initialProps__.user} 
  		purchases={window.__initialProps__.purchases} 
  		assignment={window.__initialProps__.assignment}
  		title={window.__initialProps__.title} />,
  	document.getElementById('app')
);