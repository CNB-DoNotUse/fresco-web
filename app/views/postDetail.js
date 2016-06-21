import React from 'react'
import ReactDOM from 'react-dom'
import TopBar from './../components/topbar'
import App from './app'
import PostInfo from './../components/postDetail/post-info'
import PostRelated from './../components/postDetail/post-related'
import PostRelatedTags from './../components/postDetail/post-related-tags'
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
 			gallery: this.props.gallery,
            post: this.props.post
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
        var post = this.state.post;
        
        if(gallery.visibility !== this.state.gallery.visibility){
            post.approvals = gallery.visibility;
        }

        //Check if address is set, then update the post's address
        if(gallery.posts[0].location.address) {
            post.location.address = gallery.posts[0].location.address;
        }

 		this.setState({
 			gallery: gallery,
            post: post
 		});
 	}

 	render() {
 		var editable = this.props.user.rank >= global.RANKS.CONTENT_MANAGER && this.state.gallery.id,
 			galleryEdit = '',
 			relatedPosts = '',
            relatedTags = '';

 		if(editable){
 			galleryEdit = <GalleryEdit
                                gallery={this.state.gallery}
                                toggled={this.state.toggled}
                                toggle={this.toggle}
                                updateGallery={this.updateGallery}
                                hide={this.hide} />

        }

		relatedPosts = <PostRelated gallery={this.state.gallery} />

        relatedTags = <PostRelatedTags tags={this.state.gallery.tags} />
                            
 		return (
 			<App user={this.props.user}>
 				<TopBar
 					title={this.props.title}
 					editable={editable}
 					edit={this.toggle} />

 				<div className="content">
 					<div className="row">
 						<div className="main">
 							<PostDetailImage
 								post={this.state.post}
 								user={this.props.user}
 								purchases={this.props.purchases} />

 							<PostInfo
								user={this.props.user}
 								post={this.state.post}
 								gallery={this.state.gallery}
 								user={this.props.user}
 								verifier={this.props.verifier} />
 						</div>
 					</div>
					{relatedPosts}

                    {relatedTags}
 				</div>
                
 				{galleryEdit}
 			</App>
 		);
 	}

}

PostDetail.defaultProps = {
	gallery: {}
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
