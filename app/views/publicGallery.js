import React from 'react'
import ReactDOM from 'react-dom'
import TopBar from './../components/topbar.js'
import PostInfo from './../components/post-info.js'
import PostRelated from './../components/post-related.js'
import PostDetailImage from './../components/post-detail-image.js'
import GalleryEdit from './../components/editing/gallery-edit.js'
import App from './app.js'

/**
 * Public Gallery Page
 */

class PublicGallery extends React.Component {

 	constructor(props) {
 		super(props);
 	}

 	render() {

 		var gallery = this.props.gallery;

 		<Slider
 			dots={true}>
 			{galleryImages ? galleryImages : <div></div>}
 		</Slider>

 		var galleryImages = [];
 		gallery.posts.map((post, i) => {
 			if(post.video) {
 				galleryImages.push(
 					<div key={i}>
 						<video width="100%" height="100%" data-id={post._id} controls>
 							<source src={post.video.replace('/videos', '/videos/mp4').replace('.m3u8', '.mp4')} type="video/mp4" />
 							Your browser does not support the video tag.
 						</video>
 					</div>
 				)
 			}
 			return (
 				<div key={i}><img className="img-responsive" src={global.formatImg(post.image, 'medium')} data-id={post._id} /></div>
 			);
 		});

 		return (
 			<nav id="gallery-nav">
				<a id="wordmark" href="/"><img alt="Fresco" src="https://d1dw1p6sgigznj.cloudfront.net/images/wordmark-nav.png"></a>
			</nav>
			<section className="dark nohover" id="highlights">
				<div className="slick slick_gallery">
					<% for (var index in gallery.posts){ %>
						<% if (index > 0) { %>
						<div className="slide hide">
						<% } else { %>
						<div className="slide">
						<% } %>
							<div>
								<% if(index == 0) {%>
									<img className="carousel" src="<%= config.formatImg(gallery.posts[index].image, 'large') %>">
								<%} else{ %>
									<img className="carousel" data-lazy="<%= config.formatImg(gallery.posts[index].image, 'large') %>">
								<% } %>
							</div>
							<div className="meta">
								<table>
									<thead>
										<tr>
											<th><img className="lazy" src="<%= gallery.posts[index].owner ? gallery.posts[index].owner.avatar : 'https://d1dw1p6sgigznj.cloudfront.net/images/user-1-small.png' %>" width="36" height="36"></th>
											<th><%= gallery.posts[index].byline %></th>
										</tr>
									</thead>
									<tbody>
										<% if (gallery.posts[index].location.address) { %>
										<tr>
											<td><span className="mdi mdi-map-marker"></span></td>
											<td><%= gallery.posts[index].location.address %></td>
										</tr>
										<% } %>
										<tr>
											<td><span className="mdi mdi-clock"></span></td>
											<td><%= config.getTimeAgo(gallery.posts[index].time_created) %></td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
					<% } %>
				</div>
			</section>
 		);
 	}

}


ReactDOM.render(
  <PublicGallery 
	  gallery={window.__initialProps__.gallery} 
	  title={window.__initialProps__.title} />,
  document.getElementById('app')
);