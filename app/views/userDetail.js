import React from 'react'
import ReactDOM from 'react-dom'
import App from './app'
import UserSidebar from './../components/userDetail/user-sidebar'
import TopBar from './../components/topbar'
import PostList from './../components/global/post-list'
import global from './../../lib/global'

/**
 * User Detail Parent Object, made of a user side column and PostList
 */

class UserDetail extends React.Component {

	constructor(props) {
		super(props);

		this.loadPosts = this.loadPosts.bind(this);
		this.edit = this.edit.bind(this);
	}

 	render() {

 		console.log(this.props);

 		return (
 			<App user={this.props.user}>
 				<TopBar 
 					title={this.props.detailUser.firstname + ' ' + this.props.detailUser.lastname}
					editable={this.props.editable}
					edit={this.edit} />
				
				<UserSidebar 
					user={this.props.detailUser} />
				
				<div className="col-sm-8 tall">
					<PostList 
						loadPosts={this.loadPosts}
						size='large'
						rank={this.props.user.rank}
						scrollable={true} />
				</div>
 			</App>
 		);

 	}

 	edit() {
 		window.location.href = "/user/settings";
 	}

 	//Returns array of posts for the user 
 	//with offset and callback, used in child PostList
 	loadPosts(passedOffset, callback) {

		var params = {
			id: this.props.user._id,
			limit: 15,
			offset: passedOffset,
		};

 		$.ajax({
 			url:  '/api/user/posts',
 			type: 'GET',
 			data: params,
 			dataType: 'json',
 			success: (response, status, xhr) => {

 				//Do nothing, because of bad response
 				if(!response.data || response.err){
 					$.snackbar({content: 'We couldn\'t load this user\'s posts!'});
 					callback([]);
 				}
 				else
 					callback(response.data);

 			},
 			error: (xhr, status, error) => {
 				$.snackbar({content: resolveError(error)});
 			}

 		});

 	}

}

ReactDOM.render(
  	<UserDetail 
  		user={window.__initialProps__.user} 
  		detailUser={window.__initialProps__.detailUser} 
  		editable={window.__initialProps__.editable}
  		purchases={window.__initialProps__.purchases} 
  		title={window.__initialProps__.title} />,
  	document.getElementById('app')
);