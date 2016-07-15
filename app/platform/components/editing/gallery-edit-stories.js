import React, { PropTypes } from 'react';
import Tag from './tag';
import utils from 'utils';

/**
 * Component for managing added/removed stories
 */

class GalleryEditStories extends React.Component {
    constructor(props) {
        super(props);
        this.state = { suggestions: [] };
        this.addStory = this.addStory.bind(this);
        this.removeStory = this.removeStory.bind(this);
        this.change = this.change.bind(this);
    }

    /**
     * Adds story element, return if story exists in prop stories.
     */
    addStory(newStory) {
        if (utils.isEmptyString(newStory.title)) return;

        // Clear the input field
        this.refs.autocomplete.value = '';
        this.refs.dropdown.style.display = 'none';

        const stories = this.props.relatedStories;

        // Check if story already exists
        for(var s in stories) {
            if (stories[s]._id && stories[s]._id == newStory._id) return;
        }

        stories.push(newStory);

        this.props.updateRelatedStories(stories);
    }

    /**
     * Removes story and updates to parent
     */
    removeStory(index) {
        const relatedStories = this.props.relatedStories;

        // Remove from index
        relatedStories.splice(index, 1);

        this.props.updateRelatedStories(relatedStories);
    }

    change(e) {
        // Current fields input
        const query = this.refs.autocomplete.value;

        // Enter is pressed, and query is present
        if (e.keyCode === 13 && query.length > 0){
            let matched = -1;

            // Checking if what the user entered is in the suggestions
            for (var i = 0; i < this.state.suggestions.length; i++) {
                if (this.state.suggestions[i].title.toLowerCase() === query.toLowerCase()){
                    // Convert to lowercase for better check
                    matched = i;
                    break;
                }
            }

            if (matched >= 0) {  //If there is a match, add the existing
                this.addStory(this.state.suggestions[matched]);
            } else { //Not a match, add a brand new story
                this.addStory({ title: query, new: true });
            }
        } else {
            // Field is empty
            if (query.length == 0) {
                this.setState({ suggestions: [] });
                this.refs.dropdown.style.display = 'none';
            } else {
                this.refs.dropdown.style.display = 'block';

                $.ajax({
                    url: '/api/search',
                    data: { 'stories[q]': query },
                    success: (res) => {
                        if (res.stories) {
                            this.setState({ suggestions: res.stories });
                        }
                    },
                });
            }
        }
    }

    render() {
        // Map out related stories
        const stories = this.props.relatedStories.map((story, i) => (
            <Tag
                text={story.title}
                plus={false}
                onClick={this.removeStory.bind(null, i)}
                key={i}
            />
        ));

        // Map suggestions for dropdown
        const suggestions = this.state.suggestions.map((story, i) => (
            <li onClick={this.addStory.bind(null, story)} key={i}>{story.title}</li>
        ));

        return (
            <div className="dialog-row split chips form-group-default">
                <div className="split-cell">
                    <input
                        type="text"
                        className="form-control floating-label"
                        placeholder="Stories"
                        onKeyUp={this.change}
                        ref='autocomplete'
                    />

                    <ul ref="dropdown" className="dropdown">
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

GalleryEditStories.defaultProps = {
    updateRelatedStories: () => {},
    relatedStories: [],
};

GalleryEditStories.propTypes = {
    relatedStories: PropTypes.array,
    updateRelatedStories: PropTypes.func,
};

export default GalleryEditStories;

