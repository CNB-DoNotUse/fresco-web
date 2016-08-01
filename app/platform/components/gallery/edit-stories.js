import React, { PropTypes } from 'react';
import Tag from '../global/tag';
import utils from 'utils';
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
    }

    onChangeQuery(e) {
        const query = e.target.value;
        this.setState({ query });

        // Enter is pressed, and query is present
        if (query.length === 0) {
            this.setState({ suggestions: [] });
        } else {
            $.ajax({
                url: '/api/search?stories=true',
                data: { q: query },
                success: (res) => {
                    if (res.stories && res.stories.results) {
                        this.setState({ suggestions: res.stories.results });
                    }
                },
            });
        }
    }

    /**
     * Adds story element, return if story exists in prop stories.
     */
    addStory(newStory) {
        if (utils.isEmptyString(newStory.title)) return;
        this.setState({ query: '' });
        let { stories } = this.props;

        // Check if story already exists
        if (stories.some((s) => (s.id === newStory.id))) return;
        stories = stories.concat(newStory);

        this.props.updateStories(stories);
    }

    /**
     * Removes story and updates to parent
     */
    removeStory(id) {
        let { stories } = this.props;
        stories = reject(stories, { id });

        this.props.updateStories(stories);
    }

    render() {
        const { query } = this.state;
        const stories = this.props.stories.map((story, i) => (
            <Tag
                text={story.title}
                plus={false}
                onClick={() => this.removeStory(story.id)}
                key={i}
            />
        ));

        // Map suggestions for dropdown
        const suggestions = this.state.suggestions.map((story, i) => (
            <li
                onClick={() => this.addStory(story)}
                key={i}
            >
                {story.title}
            </li>
        ));

        return (
            <div className="dialog-row split chips form-group-default">
                <div className="split-cell">
                    <input
                        type="text"
                        className="form-control floating-label"
                        placeholder="Stories"
                        onChange={(e) => this.onChangeQuery(e)}
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

EditStories.defaultProps = {
    updateStories: () => {},
    stories: [],
};

EditStories.propTypes = {
    stories: PropTypes.array,
    updateStories: PropTypes.func,
};

export default EditStories;

