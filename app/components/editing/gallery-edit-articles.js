import React from 'react'
import Tag from './tag.js'

/**
 * Component for managing added/removed articles
 */

export default class GalleryEditArticles extends React.Component {

	constructor(props) {
		super(props);
		this.state = { 
			suggestions: []
		}
		this.addArticle = this.addArticle.bind(this);
		this.removeArticle = this.removeArticle.bind(this);
		this.change = this.change.bind(this);
	}

	/**
	 * Removes article at passed index
	 */
	removeArticle(index) {
		//Remove from index
		var articles = this.props.articles.splice(index, 1);

		//Update state
		this.setState({ articles: articles });
	}

	/**
	 * Adds article element, returns if article exists in prop stories.
	 */
	addArticle(article) {
		//Clear the input field
		this.refs.autocomplete.value = ''
		this.refs.dropdown.style.display = 'none';

		var articles = this.props.articles;

		//Check if article already exists
		for( var a in articles ) {
			if(articles[a]._id == article._id) return;
		}
		
		articles.push(article);

		this.props.updateArticles(articles);
	}

	change(e) {

		//Current fields input
		var query = this.refs.autocomplete.value;

		//Enter is pressed
		if(e.keyCode == 13){

			this.addArticle(query);

		} else{

			//Field is empty
			if(query.length == 0){
				this.setState({ suggestions: [] });
				this.refs.dropdown.style.display = 'none';
			} else{

				this.refs.dropdown.style.display = 'block';

				$.ajax({
					url: '/scripts/article/search',
					data: { q: query },
					success: (result, status, xhr) => {

						if(result.data){

							this.setState({ suggestions: result.data });
							
						}	
					}
				});
			}

		}
	}

	render() {

		var articles = this.props.articles.map((article, i) => {

			return (
				<Tag 
					onClick={this.removeArticle.bind(null, article._id)}
					text={article.link} 
					plus={false}
					key={i} />
			)

		});

		//Map suggestions for dropdown
		var suggestions = this.state.suggestions.map((article, i) => {
		
			return <li  onClick={this.addArticle.bind(null, article)}
						key={i}>{article.link}</li>
		
		});
		
		return (
			<div className="dialog-row split chips">
				<div className="split-cell">
					<input 
						type="text" 
						className="form-control" 
						placeholder="Articles"
						onChange={this.change}
						ref='autocomplete' />
					
					<ul ref="dropdown" className="dropdown">
						{suggestions}
					</ul>
					
					<ul className="chips">
						{articles}
					</ul>
				</div>
				
				<div className="split-cell">
					<span className="md-type-body2">Add Articles</span>
					
					<ul className="chips"></ul>
				</div>
			</div>
		);

	}

}

GalleryEditArticles.defaultProps = {
	updateArticles: () => {},
	articles: []
}
