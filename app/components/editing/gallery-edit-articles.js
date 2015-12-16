import React from 'react'
import Tag from './tag.js'

/**
 * Component for managing added/removed articles
 */

export default class GalleryEditArticles extends React.Component {

	constructor(props) {
		super(props);
		this.state = { articles: this.props.articles }
		this.handleClick = this.handleClick.bind(this);
	}

	componentWillReceiveProps(nextProps) {

		this.setState({	
			articles: nextProps.articles 
		});
		
	}

	handleClick(index) {

		var updateArticles = this.state.articles;

		//Remove from index
		updateArticles.splice(index, 1);

		//Update state
		this.setState({
			articles: updateArticles
		});

	}

	render() {

		var articles = this.state.articles.map((article, i) => {

			return (

				<Tag 
					onClick={this.handleClick.bind(this, i)} 
					text={article.link} 
					plus={false}
					key={i} />

			)

		});
		
		return (
			<div className="dialog-row split chips">
				<div className="split-cell">
					<input 
						id="gallery-articles-input" 
						type="text" 
						className="form-control floating-label" 
						placeholder="Articles" />
					<ul id="gallery-articles-list" className="chips">{articles}</ul>
				</div>
			</div>
		);

	}

}