import React from 'react'
import Tag from './tag.js'
import utils from 'utils'

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
	 * Removes article with passed id
	 */
	removeArticle(id) {

		var index = -1;
		for (var a in this.props.articles) {
			if(this.props.articles[a].id == id) {
				index = a;
				break;
			}
		}

		if(index == -1) return;
		var articles = this.props.articles;
			//Remove from index
			articles.splice(index, 1);

		//Update state
		this.props.updateArticles(articles);
	}

	/**
	 * Adds article element, returns if article exists in prop stories.
	 */
	addArticle(article) {
		if(utils.isEmptyString(article.link)) return;

		//Clear the input field
		this.refs.autocomplete.value = ''
		this.refs.dropdown.style.display = 'none';

		var articles = this.props.articles;

		//Check if article already exists
		for( var a in articles ) {
			if(articles[a].link == article.link) return;
		}

		articles.push(article);

		this.props.updateArticles(articles);
	}

	change(e) {

		//Current fields input
		var query = this.refs.autocomplete.value;

		//Enter is pressed, and query is present
		if(e.keyCode == 13 && query.length > 0){

			if(utils.isValidUrl(query)){
				this.addArticle({
					link: query,
					new: true
				});
			}
			else{
				return $.snackbar({content: "Please enter a valid url!"});
			}


		} else{

			//Field is empty
			if(query.length == 0){
				this.setState({ suggestions: [] });
				this.refs.dropdown.style.display = 'none';
			} else{

				this.refs.dropdown.style.display = 'block';

				$.ajax({
					url: '/api/article/search',
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

		var articles = [];

		for (var a in this.props.articles) {
			var article = this.props.articles[a];
			articles.push(
				<Tag
					onClick={this.removeArticle.bind(null, article.id)}
					text={article.link}
					plus={false}
					key={a} />
			);
		}

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
						className="form-control floating-label"
						placeholder="Articles"
						onKeyUp={this.change}
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
