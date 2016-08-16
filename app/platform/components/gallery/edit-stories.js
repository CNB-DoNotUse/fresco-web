import React, { PropTypes } from 'react';
import Tag from '../global/tag';
import reject from 'lodash/reject';

/**
 * Component for managing added/removed stories
 */

class EditStories extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            suggestions: [],
            query: '',
        };
        this.onClick = this.onClick.bind(this);
    }

    componentWillMount() {
        document.addEventListener('click', this.onClick);
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.onClick);
    }

    onClick(e) {
        // if (ReactDOM.findDOMNode(this.area).contains(e.target)) {
        if (this.area && this.area.contains(e.target)) {
            return;
        }

        this.setState({ query: '' });
    }

    onChangeQuery(e) {
        const query = e.target.value;
        this.setState({ query });

        // Enter is pressed, and query is present
        if (!query.length === 0) {
            this.setState({ suggestions: [] });
        } else {
            $.ajax({
                url: '/api/search',
                data: { 'stories[a][title]': query },
                success: (res) => {
                    if (res.stories && res.stories.results) {
                        this.setState({ suggestions: res.stories.results });
                    }
                },
            });
        }
    }

    /**
     * onKeyUpQuery
     * on typing enter, checks if query is a suggestion,
     * adds suggestion if so, new story if not
     * @param {object} e key up event
     */
    onKeyUpQuery(e) {
        const { suggestions, query } = this.state;

        if (e.keyCode === 13 && query.length > 0) {
            const matched = suggestions.find((s) => (
                s.title.toLowerCase() === query.toLowerCase()
            ));

            this.addStory(matched || { title: query, new: true });
        }
    }

    /**
     * Adds story element, return if story exists in prop stories.
     */
    addStory(newStory) {
        if (!newStory.title || !newStory.title.length) return;
        let { stories } = this.props;

        // Check if story already exists
        if (!newStory.new && stories.some((s) => (s.id === newStory.id))) return;
        stories = stories.concat(newStory);

        this.setState({ query: '' }, this.props.updateStories(stories));
    }

    /**
     * Removes story and updates to parent
     */
    removeStory(title) {
        let { stories } = this.props;
        stories = reject(stories, { title });

        this.props.updateStories(stories);
    }

    render() {
        const { query } = this.state;
        const stories = this.props.stories.map((story, i) => (
            <Tag
                text={story.title}
                plus={false}
                onClick={() => this.removeStory(story.title)}
                key={i}
            />
        ));

        // Map suggestions for dropdown
        const suggestions = this.state.suggestions.map((story, i) => (
            <li onClick={() => this.addStory(story)} key={i}>
                {story.title}
            </li>
        ));

        return (
            <div
                ref={(r) => this.area = r}
                className="dialog-row split chips form-group-default"
            >
                <div className="split-cell">
                    <input
                        type="text"
                        className="form-control floating-label"
                        placeholder="Stories"
                        onChange={(e) => this.onChangeQuery(e)}
                        onKeyUp={(e) => this.onKeyUpQuery(e)}
                        value={query}
                    />

                    <ul
                        style={{ display: `${query.length ? 'block' : 'none'}` }}
                        className="dropdown"
                    >
                        {suggestions}
                    </ul>

                    <ul className="chips">
                        {stories}
                    </ul>
                </div>
            </div>

        );
    }
}

EditStories.propTypes = {
    stories: PropTypes.array.isRequired,
    updateStories: PropTypes.func.isRequired,
};

EditStories.defaultProps = {
    updateStories() {},
    stories: [],
};

export default EditStories;

