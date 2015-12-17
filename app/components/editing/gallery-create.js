import React from 'react'
import GalleryEditTags from './gallery-edit-tags'
import GalleryEditArticles from './gallery-edit-articles'
import GalleryEditStories from './gallery-edit-stories'
import EditPost from './edit-post.js'
import Slick from 'react-slick'

/** //

Description : Component for creating a gallery

// **/

/**
 * Gallery Create Parent Object
 */

export default class GalleryCreate extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			tags: [],
			relatedStories: [],
			articles: [],
			visibility: 0 
		}
		this.clear = this.clear.bind(this);
		this.create = this.create.bind(this);
		this.toggleVisibility = this.toggleVisibility.bind(this);
		this.updateRelatedStories = this.updateRelatedStories.bind(this);
		this.updateArticles = this.updateArticles.bind(this);
		this.updateTags = this.updateTags.bind(this);
		this.updatedState = this.updateState.bind(this);
	}

 	/**
 	 * Hides the window
 	 */
 	hide() {
 		$(".toggle-gcreate").toggleClass("toggled");
 	}

 	/**
 	 * Clears the form of inputed data
 	 * @return {[type]} [description]
 	 */
 	clear() {

 		this.refs.caption.value = '';

 		this.setState({
 			tags: [],
 			relatedStories: [],
 			articles: []
 		});

 	}

 	toggleVisibility() {
 		this.setState({
 			visibility: this.state.visibility == 0 ? 2 : 0
 		})
 	}

 	updateState(field, value) {
 		console.log('Test');
 		this.setState({
 			fields: value
 		})
 	}

 	updateTags(tags) {
 		this.setState({
 			tags: tags
 		});
 	}

 	updateRelatedStories(relatedStories) {
 		this.setState({
 			relatedStories: relatedStories
 		});
 	}

 	updateArticles(articles) {
 		this.setState({
 			articles: articles
 		});
 	}

 	/**
 	 * Creates the gallery on button click
 	 */
 	create() {

 		var caption = this.refs.caption.value,
 			tags = this.state.tags,
 			visibility = this.state.visibility;

 		//Generate post ids for update
 		var posts = this.props.posts.map((post) => {
 			return post._id
 		});

 		console.log('Posts', posts);
 		

		if(posts.length == 0) 
			return $.snackbar({content:"Galleries must have at least 1 post"});

 		//Generate stories for update
 		var stories = this.state.relatedStories.map((story) => {

 			if(story.new)
 				return 'NEW=' + JSON.stringify(story);
 			else
 				return story._id;

 		});

 		//Generate articles for update
 		var articles = this.state.articles.map((articles) => {

 			if(articles.new)
 				return 'NEW=' + JSON.stringify(articles);
 			else
 				return articles._id;

 		});	

 		var params = {
 			caption: caption,
 			posts: posts,
 			tags: tags,
 			visibility: visibility,
 			articles: articles,
 			stories: stories,
 		};

 		$.ajax("/scripts/gallery/create", {
 			method: 'post',
 			contentType: "application/json",
 			data: JSON.stringify(params),
 			success: (result) => {
 				if(result.err && !result.data){
 					$.snackbar({
 						content: global.resolveError(result.err, "There was an error creating your gallery!")
 					});

 				}
 				else{

 					this.hide();

 					$.snackbar({ 
 						content: 'Gallery successfully saved! Click here to view it', 
 						timeout: 5000 
 					}).click(() => {
						var win = window.open('/gallery/' + result.data._id, '_blank');
						win.focus();
					});

 				}
 			}
 		});
 	}
	
	render() {

		//Map out posts for slick slider
		var posts = this.props.posts.map((post, i) =>{

			return <div key={i++}>
						<EditPost post={post} />
					</div>

		});

 		return (
 			<div>
	 			
	 			<div className="dim toggle-gcreate">
	 			</div>

	 			<div className="edit panel panel-default toggle-gcreate gcreate">
		 			
		 			<div className="col-xs-12 col-lg-12 edit-new dialog">
		 				
		 				<div className="dialog-head">
		 					<span className="md-type-title">Create Gallery</span>
		 					<span className="mdi mdi-close pull-right icon toggle-edit toggler" onClick={this.hide}></span>
		 				</div>
		 					
	 					<div className="dialog-foot">
	 						<button onClick={this.clear} type="button" className="btn btn-flat">Clear all</button>
	 						<button onClick={this.create}  type="button" className="btn btn-flat pull-right">Save</button>
	 						<button onClick={this.hide} type="button" className="btn btn-flat pull-right toggle-gcreate toggler toggled">Discard</button>
	 					</div>
	 					
	 					<div className="dialog-body">
	 						<div className="dialog-col col-xs-12 col-md-7 form-group-default">
	 							<div className="dialog-row">
	 								<textarea 
	 									ref="caption" 
	 									type="text" 
	 									className="form-control floating-label" 
	 									placeholder="Caption" />
	 							</div>
	 							
	 							<GalleryEditTags 
	 								ref='tags' 
	 								tags={this.state.tags} 
	 								updateTags={this.updateTags} />
	 							
	 							<GalleryEditStories 
	 								relatedStories={this.state.relatedStories}
	 								updateRelatedStories={this.updateRelatedStories} />
	 							
	 							<GalleryEditArticles 
	 								articles={this.state.articles}
	 								updateArticles={this.updateArticles} />
	 							
	 							<div className="dialog-row">
									<div className="checkbox">
										<label>
											<input 
												ref="highlight" 
												type="checkbox" 
												onChange={this.toggleVisibility} /> Highlighted
										</label>
									</div>
								</div>
	 						</div>

	 						<Slick
	 							dots={true} 
	 							className="dialog-col col-xs-12 col-md-5">
	 							{posts}
	 						</Slick>

	 					</div>

	 				</div>
	 			</div>
 			</div>
 		);
 	}
	


}