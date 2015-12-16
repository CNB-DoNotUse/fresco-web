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
			stories: [],
			articles: []
		}
		this.clear = this.clear.bind(this);
		this.create = this.create.bind(this);
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

 		this.refs.captions.value = '';

 		this.setState({
 			tags: [],
 			stories: [],
 			articles: []
 		});

 	}

 	/**
 	 * Tag handler for child component
 	 */
 	updateTags(tags) {

 		this.setState({
 			tags: tags
 		});

 	}

 	/**
 	 * Creates the gallery on button click
 	 */
 	create() {

 		var caption = this.refs.caption.value,
 			tags = this.state.tags,
 			visibility = this.refs.highlight.value;

 		//Generate post ids for update
 		var posts = this.props.posts.map((post) => {
 			return post._id
 		});

 		console.log('Posts', posts);
 		

		if(posts.length == 0) 
			return $.snackbar({content:"Galleries must have at least 1 post"});

 		//Generate stories for update
 		var stories = this.state.stories.map((story) => {

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

 		console.log(params);

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
 						htmlAllowed: true,
 						content: '<a href="/gallery/' + result.data._id + ' ">Gallery successfully saved! Click here to view it</a>' 
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
	 							
	 							<GalleryEditStories stories={this.state.stories} />
	 							
	 							<GalleryEditArticles articles={this.state.articles} />
	 							
	 							<div className="dialog-row">
									<div className="checkbox">
										<label>
											<input ref="highlight" type="checkbox" /> Highlighted
										</label>
									</div>
								</div>
	 						</div>

	 						<Slick className="dialog-col col-xs-12 col-md-5">{posts}</Slick>

	 					</div>

	 				</div>
	 			</div>
 			</div>
 		);
 	}
	


}