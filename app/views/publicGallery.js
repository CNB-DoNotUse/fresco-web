import React from 'react'
import ReactDOM from 'react-dom'
import App from './app.js'
import Slider from 'react-slick'
import global from '../../lib/global'
import moment from 'moment'

/**
 * Public Gallery Page
 */

class PublicGallery extends React.Component {

 	constructor(props) {
 		super(props);
 	}

 	render() {

 		var gallery = this.props.gallery;

 		//Store sliders for slick
 		var galleryImages = [],
 			settings = {
 			  dots: true,
 			  arrows: true
 			};
 		
 		for (var i = 0; i < gallery.posts.length; i++) {

 			var galleryMedia,
 				post = gallery.posts[i],
 				avatar = post.owner ? post.owner.avatar : global.defaultAvatar,
 				address = post.location.address !== 'undefined' ? post.location.address : 'No location';
		
 			galleryImages.push(
 				<div className="slide" key={i}>
 					
 					<div> 
 						<img className="img-responsive" src={global.formatImg(post.image, 'medium')} data-id={post._id} />
 					</div>
 					
 					<div className="meta">
 						<table>
 							<thead>
 								<tr>
 									<th><img className="lazy" src={avatar} width="36" height="36" /></th>
 									<th>{gallery.posts[i].byline}</th>
 								</tr>
 							</thead>

 							<tbody>
 								<tr>
									<td><span className="mdi mdi-map-marker"></span></td>
									<td>{address}</td>
								</tr>
 								
 								<tr>
 									<td><span className="mdi mdi-clock"></span></td>
 									<td></td>
 								</tr>
 							</tbody>
 						</table>
 					</div>
 				</div>
 			)
 		}

 		return (

 			<div>
	 			<nav id="gallery-nav">
					<a id="wordmark" href="/">
						<img alt="Fresco" src="https://d1dw1p6sgigznj.cloudfront.net/images/wordmark-nav.png" />
					</a>
				</nav>
				
				<section className="dark nohover"  id="highlights">
					<Slider {...settings} className="slick slick_gallery">
						{galleryImages ? galleryImages : <div></div>}
					</Slider>
				</section>
				
				<div className="container" id="gallery-info">
					<div className="row">
						<div className="col-md-6 section">
							<p>{gallery.caption}</p>
							
							<br />
							
							<a href="https://itunes.apple.com/app/apple-store/id872040692?pt=83522801&ct=GalleryPostBtn&mt=8" target="_blank">
								<img src="https://d1dw1p6sgigznj.cloudfront.net/images/store-apple.svg" />
							</a>
						</div>
						<PublicGalleryRelatedInfo gallery={gallery} />
					</div>
				</div>
			</div>
 		);
 	}


}

class PublicGalleryRelatedInfo extends React.Component {

	constructor(props){
		super(props);
		this.state = {
			relatedGalleries: [],
			relatedStories: []
		}
		this.loadRelatedGalleries = this.loadRelatedGalleries.bind(this);
		this.loadRelatedGalleries = this.loadRelatedGalleries.bind(this);
	}

	componentDidMount() {

		// this.loadRelatedGalleries();
		// this.loadRelatedStories();
	      
	}

	render() {

		var gallery = this.props.gallery,
			relatedGalleries = '',
			relatedStories = '',
			relatedArticles = '';

		console.log(gallery);

		if(gallery.articles.length > 0){

			var articles = gallery.articles.map((article, i)  => {

				return <li key={i}>
							<span>
								<img className="favicon" src={article.favicon} />
							</span>
							<a href={article.link}>{article.title}</a>
						</li>

			});

			var relatedArticles = <div className="story">
										<h2 className="section">Articles</h2>
										<div className="meta-list">
											<ul className="md-type-subhead">{articles}</ul>
										</div>
									</div>

		}

		if(gallery.related_stories.length > 0){

			var stories = gallery.related_stories.map((story, i) => {

				return;

			});

			var relatedStories = <div className="story">
									<h2 className="section">More from</h2>
									<div className="meta-list">
										<ul className="md-type-subhead"></ul>
									</div>
								</div>

		}

		if(this.state.relatedGalleries.length){

			var galleries = this.state.relatedGalleries.map((gallery, i)  => {

				return <a className="gallery" href={'/gallery/' + gallery._id}>
							<img className="post lazy" src={global.formatImg(gallery.posts[0].image, 'small')} />
						</a>

			});

			var relatedGalleries = <div className="story">
										<h2 className="section">Related Stories</h2>
										<div className="meta-list">
											<ul className="md-type-subhead">{galleries}</ul>
										</div>
									</div>

		}

		return (
			<div className="col-md-6 section">
				{relatedGalleries}
				{relatedStories}
				{relatedArticles}
			</div>	
		)

	}

	loadRelatedStories(){




	}

	/**
	 * Loads related galleries for the components passed gallery based on its tags
	 * @return {[type]} [description]
	 */
	loadRelatedGalleries(){

		var params = {
			limit: 10,
			offset: 0,
			verified: 'true',
			tags: this.props.gallery.tags.join(',')
		}

		$.ajax({
			url:  global.API_URL + 'gallery/list?',
			type: 'GET',
			data: params,
			dataType: 'json',
			success: (response, status, xhr) => {

				//Check for valid response
				if(response.data && !response.err){
					this.setState({
						relatedGalleries: response.data
					});
				}

			}

		});

	}

	loadRelatedStories() {


	}


}


ReactDOM.render(
  <PublicGallery 
	  gallery={window.__initialProps__.gallery} 
	  title={window.__initialProps__.title} />,
  document.getElementById('app')
);