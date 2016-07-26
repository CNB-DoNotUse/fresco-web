import React, { PropTypes } from 'react';
import Tag from '../editing/tag.js';
import utils from 'utils';
import remove from 'lodash/remove';

/**
 * Component for managing added/removed articles
 */

class EditArticles extends React.Component {
    constructor(props) {
        super(props);

        this.state = { suggestions: [] };
    }

    onChange(e) {
		// Current fields input
        const query = this.refs.autocomplete.value;

        // Enter is pressed, and query is present
        if (e.keyCode === 13 && query.length > 0) {
            if (utils.isValidUrl(query)) {
                this.addArticle({ link: query, new: true });
            } else {
                $.snackbar({ content: "Please enter a valid url!" });
                return;
            }
        } else {
			// Field is empty
            if (query.length == 0) {
                this.setState({ suggestions: [] });
                this.refs.dropdown.style.display = 'none';
            } else {
                this.refs.dropdown.style.display = 'block';
                $.ajax({
                    url: '/api/search?articles=true',
                    data: { q: query },
                    success: (res) => {
                        if (res.articles && res.articles.results) {
                            this.setState({ suggestions: res.articles.results });
                        }
                    },
                });
            }
        }
    }

	/**
	 * Removes article with passed id
	 */
    removeArticle(link) {
        const { articles, updateArticles } = this.props;
        remove(articles, { link });

        updateArticles(articles);
    }

	/**
	 * Adds article element, returns if article exists in prop stories.
	 */
    addArticle(article) {
        if (utils.isEmptyString(article.link)) return;

        // Clear the input field
        this.refs.autocomplete.value = '';
        this.refs.dropdown.style.display = 'none';

        const { articles } = this.props;

        // Check if article already exists
        if (articles.some((a) => a.link === article.link)) return;

        articles.push(article);

        this.props.updateArticles(articles);
    }

    renderArticles() {
        return this.props.articles.map((a, i) => (
            <Tag
                onClick={() => this.removeArticle(a.link)}
                text={a.link}
                plus={false}
                key={i}
            />
        ));
    }

    renderSuggestions() {
		// Map suggestions for dropdown
        return this.state.suggestions.map((article, i) => (
            <li
                onClick={() => this.addArticle(article)}
                key={i}
            >
                {article.link}
            </li>
        ));
    }

    render() {
        return (
            <div className="dialog-row split chips">
                <div className="split-cell">
                    <input
                        type="text"
                        className="form-control floating-label"
                        placeholder="Articles"
                        onKeyUp={(e) => this.onChange(e)}
                        ref="autocomplete"
                    />

                    <ul ref="dropdown" className="dropdown">
                        {this.renderSuggestions()}
                    </ul>

                    <ul className="chips">
                        {this.renderArticles()}
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

EditArticles.propTypes = {
    updateArticles: PropTypes.func.isRequired,
    articles: PropTypes.array.isRequired,
};

EditArticles.defaultProps = {
	updateArticles: () => {},
	articles: [],
};

export default EditArticles;
