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
 			  arrows: true,
 			  infinite: false,
 			  adaptiveHeight: true
 			};
 		
 		for (var i = 0; i < gallery.posts.length; i++) {

 			var galleryMedia,
 				post = gallery.posts[i],
 				avatar = post.owner ? post.owner.avatar ? post.owner.avatar : global.defaultAvatar : global.defaultAvatar,
 				address = post.location.address != null ? post.location.address : 'No location',
				timestampText = moment(post.timestamp).format('MMM Do YYYY, h:mm:ss a'),
				style = {
					backgroundImage: 'url(' + global.formatImg(post.image, 'medium') + ')'
				}

 			galleryImages.push(
 				<div className="slick-slide" key={i} style={style}>

 					<table className="slick-meta">
						<tbody>
							<tr className="user">
								<td>
									<img src={avatar} />
								</td>
								<td className="meta-text byline">{gallery.posts[i].byline}</td>
							</tr>
							<tr>
								<td><span className="mdi mdi-map-marker"></span></td>
								<td className="meta-text">{address}</td>
							</tr>
							<tr>
								<td><span className="mdi mdi-clock"></span></td>
								<td className="meta-text">{timestampText}</td>
							</tr>
						</tbody>
					</table>
 				</div>
 			)
 		}

 		return (

 			<div>
	 			<nav>
					<a className="wordmark" href="/">
						<img alt="Fresco" src="https://d1dw1p6sgigznj.cloudfront.net/images/wordmark-nav.png" />
					</a>
				</nav>

				<div className="page">
					<div className="gallery-slick-wrap">
						<Slider {...settings} className="slick">
							{galleryImages ? galleryImages : <div></div>}
						</Slider>
					</div>
					
					<div className="gallery-info-wrap">
						<div className="gallery-info">
							<div className="column">
								<p className="caption">{gallery.caption}</p>
								
								<br />
								
								<a href="https://itunes.apple.com/app/apple-store/id872040692?pt=83522801&ct=GalleryPostBtn&mt=8" target="_blank">
									<img src="https://d1dw1p6sgigznj.cloudfront.net/images/store-apple.svg" />
								</a>
							</div>
							<PublicGalleryInfo 
								gallery={gallery} />
						</div>
					</div>
				</div>
			</div>
 		);
 	}


}

class PublicGalleryInfo extends React.Component {

	constructor(props){
		super(props);
		this.state = {
			relatedGalleries: [],
			relatedStory: {
				galleries: [],
				title: ''
			}
		}
		this.loadRelatedGalleries = this.loadRelatedGalleries.bind(this);
		this.loadRelatedStory = this.loadRelatedStory.bind(this);
	}

	componentDidMount() {
	    this.loadRelatedGalleries(); 
	    if(this.props.gallery.related_stories.length > 0)
		    this.loadRelatedStory();
	}

	/**
	 * Loads related galleries for the components passed gallery based on its tags
	 * @return {[type]} [description]
	 */
	loadRelatedGalleries(){
		$.ajax({
			url:  '/scripts/gallery/list',
			type: 'GET',
			data: {
				limit: 10,
				offset: 0,
				verified: 'true',
				tags: this.props.gallery.tags.join(',')
			},
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

	/**
	 * Loads the first related story in the gallery
	 */
	loadRelatedStory() {
		var story = this.props.gallery.related_stories[0];

		$.ajax({
			url:  global.API_URL + '/v1/story/galleries',
			type: 'GET',
			data: {
				id: story._id
			},
			dataType: 'json',
			success: (response, status, xhr) => {

				//Check for valid response
				if(response.data && !response.err){
					this.setState({
						relatedStory: {
							galleries: response.data,
							title: story.title
						}
					});
				}
			}
		});
	}

	render() {

		var gallery = this.props.gallery,
			relatedGalleries = '',
			relatedStories = '',
			relatedArticles = '';

		if(this.state.relatedStory.galleries.length > 0){

			var galleries = this.state.relatedStory.galleries.map((gallery, i) => {

				return <li key={i} className="gallery">
							<a href={'/gallery/' + gallery._id}>
								<img src={global.formatImg(gallery.posts[0].image, 'small')} />
							</a>
						</li>

			});

			relatedStories = <PublicGalleryInfoSection 
									title={"MORE FROM " + this.state.relatedStory.title.toUpperCase()}
									list={galleries} />

		}

		if(this.state.relatedGalleries.length > 0){

			var galleries = this.state.relatedGalleries.map((gallery, i)  => {

				return <li key={i} className="gallery">
							<a  href={'/gallery/' + gallery._id}>
								<img src={global.formatImg(gallery.posts[0].image, 'small')} />
							</a>
						</li>

			});

			relatedGalleries = <PublicGalleryInfoSection 
									title="RELATED GALLERIES"
									list={galleries} />

		}

		if(gallery.articles.length > 0){

			var articles = gallery.articles.map((article, i)  => {

				return <li key={i} className="article">
							<img className="favicon" src={global.getFaviconForUrl(article.link)} />
							<a href={article.link}>{article.title != '' ? article.title : article.link}</a>
						</li>

			});

			var relatedArticles = <PublicGalleryInfoSection 
									title="ARTICLES"
									list={articles} />


		}

		return (
			<div className="column">
				{relatedStories}
				{relatedGalleries}
				{relatedArticles}
			</div>	
		)
	}
}


class PublicGalleryInfoSection extends React.Component {

	constructor(props){
		super(props);

	}

	render() {
		return (
			<div className="gallery-info-section">
				<h2>{this.props.title}</h2>
				<ul>{this.props.list}</ul>
			</div>

		)
	}

}


ReactDOM.render(
  <PublicGallery 
	  gallery={window.__initialProps__.gallery} 
	  title={window.__initialProps__.title} />,
  document.getElementById('app')
);