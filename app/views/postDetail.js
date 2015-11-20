import React from 'react'
import ReactDOM from 'react-dom'
import TopBar from './../components/topbar.js'
import PostInfo from './../components/post-info.js'
import PostRelated from './../components/post-related.js'
import PostDetailImage from './../components/post-detail-image.js'
import GalleryEdit from './../components/editing/gallery-edit.js'
import App from './app.js'

/**
 * Gallery Detail Parent Object, made of a side column and PostList
 */

class PostDetail extends React.Component {

 	constructor(props) {
 		super(props);
 	}

 	render() {

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

}

PostDetail.defaultProps = {
	gallery : {}
}

ReactDOM.render(
  <PostDetail 
	  user={window.__initialProps__.user} 
	  purchases={window.__initialProps__.purchases} 
	  gallery={window.__initialProps__.gallery}
	  post={window.__initialProps__.post}
	  title={window.__initialProps__.title} />,
  document.getElementById('app')
);