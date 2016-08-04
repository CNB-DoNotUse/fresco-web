import React from 'react';

/**
 * Post Cell Stories List
 */
class PostCellStories extends React.Component {
    render() {
        let stories;

        if (this.props.stories.length) {
            stories = this.props.stories.map((stories, i) => {
                return (
                    <li key={i}>
                        <a href={'/story/' + story.id}>{story.title}</a>
                    </li>
                );
            });
        } else {
            return <div />;
        }

        return (<ul className="md-type-body2">{stories}</ul>);
    }
}

PostCellStories.defaultProps = {
    stories: [],
};

export default PostCellStories;
