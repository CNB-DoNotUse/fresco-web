import React from 'react'
import ReactDOM from 'react-dom'
import TopBar from './../components/topbar'
import App from './app'
import PostInfo from './../components/postDetail/post-info'
import PostRelated from './../components/postDetail/post-related'
import PostDetailImage from './../components/postDetail/post-detail-image'
import GalleryEdit from './../components/editing/gallery-edit'
import global from '../../lib/global'

/**
 * Post Detail Parent Object, made of a side column and PostList
 */

class PostDetail extends React.Component {

 	constructor(props) {
 		super(props);

 		this.state = {
 			toggled: false,
 			gallery: this.props.gallery
 		}

 		this.hide = this.hide.bind(this);
 		this.toggle = this.toggle.bind(this);
 		this.updateGallery = this.updateGallery.bind(this);
 	}

 	hide() {
 		this.setState({
 			toggled: false
 		});
 	}

 	toggle() {
 		this.setState({
 			toggled: !this.state.toggled
 		});
 	}

 	updateGallery(gallery) {
 		this.setState({
 			gallery: gallery
 		})
 	}

 	render() {

 		var editable = this.props.user.rank >= global.RANKS.CONTENT_MANAGER;

 		return (
 			<App user={this.props.user}>
 				<TopBar 
 					title={this.props.title}
 					editable={editable}
 					edit={this.toggle}
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
 								gallery={this.state.gallery}
 								verifier={this.props.verifier} />
 						</div>
 					</div>
 					<PostRelated gallery={this.state.gallery} />
 				</div>
 				<GalleryEdit 
 					gallery={this.state.gallery} 
 					toggled={this.state.toggled}
 					toggle={this.toggle}
 					updateGallery={this.updateGallery}
 					hide={this.hide} />
 			</App>
 		);
 	}

}

PostDetail.defaultProps = {
	gallery : {}
}

ReactDOM.render(
  <PostDetail 
	  user={window.__initialProps__.user} 
	  purchases={window.__initialProps__.purchases} 
	  gallery={window.__initialProps__.gallery}
	  verifier={window.__initialProps__.verifier || ''}
	  post={window.__initialProps__.post}
	  title={window.__initialProps__.title} />,
  document.getElementById('app')
);