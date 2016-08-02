import React, { PropTypes } from 'react';
import Tag from '../global/tag.js';
import utils from 'utils';
import reject from 'lodash/reject';

/**
 * Component for managing added/removed articles
 */

class EditArticles extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            suggestions: [],
            query: '',
        };
    }

    onChangeQuery(e) {
        const query = e.target.value;
        this.setState({ query });

        if (!query.length) {
            this.setState({ suggestions: [] });
        } else {
            $.ajax({
                url: '/api/search?articles=true',
                data: { q: query },
            })
            .done((res) => {
                if (res.articles && res.articles.results) {
                    this.setState({ suggestions: res.articles.results });
                }
            });
        }
    }

    onKeyUpQuery(e) {
        const { suggestions, query } = this.state;

        if (e.keyCode === 13 && query.length > 0) {
            const matched = suggestions.find((s) => (
                s.title && s.title.toLowerCase() === query.toLowerCase()
                    || s.link && s.link.toLowerCase() === query.toLowerCase()
            ));

            if (matched) {
                this.addArticle(matched);
            } else if (utils.isValidUrl(query)) {
                this.addArticle({ link: query, new: true });
            } else {
                $.snackbar({ content: 'Please enter a valid url!' });
            }
        }
    }
	/**
	 * Removes article with passed id
	 */
    removeArticle(link) {
        let { articles } = this.props;
        articles = reject(articles, { link });

        this.props.updateArticles(articles);
    }

	/**
	 * Adds article element, returns if article exists in prop stories.
	 */
    addArticle(article) {
        if (utils.isEmptyString(article.link)) return;
        let { articles } = this.props;

        // Check if article already exists
        if (!article.new && articles.some((a) => a.link === article.link)) return;

        articles = articles.concat(article);
        this.setState({ query: '' }, this.props.updateArticles(articles));
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
        const { query } = this.state;
        return (
            <div className="dialog-row split chips">
                <div className="split-cell">
                    <input
                        type="text"
                        className="form-control floating-label"
                        placeholder="Articles"
                        onChange={(e) => this.onChangeQuery(e)}
                        onKeyUp={(e) => this.onKeyUpQuery(e)}
                        value={query}
                    />

                    <ul
                        style={{ display: `${query.length ? 'block' : 'none'}` }}
                        className="dropdown"
                    >
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
    updateArticles() {},
    articles: [],
};

export default EditArticles;

