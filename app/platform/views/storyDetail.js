import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import TopBar from './../components/topbar';
import PostList from './../components/global/post-list';
import StorySidebar from './../components/story/sidebar';
import StoryEdit from './../components/story/edit';
import utils from 'utils';

/**
 * Story Detail Parent Object, made of a side column and PostList
 */
class StoryDetail extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			storyEditToggled: false,
			story: this.props.story,
			sort: this.props.sort || 'created_at'
		}

		this.toggleStoryEdit = this.toggleStoryEdit.bind(this);
		this.loadPosts = this.loadPosts.bind(this);
		this.updateStory = this.updateStory.bind(this);
		this.updateSort = this.updateSort.bind(this);
	}

	updateStory(story) {
		this.setState({
			story: story
		});
	}

	toggleStoryEdit() {
		this.setState({
			storyEditToggled: !this.state.storyEditToggled
		});
	}

	updateSort(sort) {
		this.setState({
			sort: sort
		})
	}

 	/**
 	 * Returns array of posts with offset and callback, used in child PostList
 	 * @param {string} lastId Last post in the list
 	 * @param {function} callback callback delivering posts
 	 */
 	loadPosts(lastId, callback) {
 		const { story } = this.state;
 		const data = {
			lastId,
			limit: 10,
			sort: this.state.sort
		};

 		$.ajax({
 			url:  `/api/story/${story.id}`,
 			type: 'GET',
 			data,
 			dataType: 'json',
 			success: (response, status, xhr) => {
 				callback(!response.data || response.err ? [] : response.body);
 			},
 			error: (xhr, status, error) => {
 				$.snackbar({content: utils.resolveError(error)});
 			}
 		});
 	}

 	render() {
 		const { user } = this.props;
 		const { story } = this.state;

 		return (
 			<App user={user}>
 				<TopBar
 					title={story.title}
					updateSort={this.updateSort}
 					edit={this.toggleStoryEdit}
					editable={true}
 					timeToggle={true}
 					chronToggle={true} />

 				<StorySidebar
 					story={story} />

 				<div className="col-sm-8 tall">
	 				<PostList
	 					rank={user.rank}
	 					loadPosts={this.loadPosts}
	 					scrollable={true}
	 					editable={false}
						sort={this.state.sort}
	 					size='large' />
				</div>

				<StoryEdit
					toggle={this.toggleStoryEdit}
					story={this.state.story}
					user={this.props.user}
					toggled={this.state.storyEditToggled}
					updateStory={this.updateStory} />
 			</App>
 		);

 	}
}


StoryDetail.propTypes = {
    story: PropTypes.object,
    user: PropTypes.object
};

ReactDOM.render(
  	<StoryDetail
  		user={window.__initialProps__.user}
  		purchases={window.__initialProps__.purchases}
  		story={window.__initialProps__.story}
  		title={window.__initialProps__.title} />,
  	document.getElementById('app')
);
