import React, { PropTypes } from 'react';
import GalleryCell from './cell';
import SuggestionList from '../highlights/suggestion-list';

/**
 * Gallery List Parent Object
 * @description : List for a gallery used across the site (/highlights, /content/galleries, etc.)
 */
class List extends React.Component {
    static propTypes = {
        withList: PropTypes.bool,
        galleries: PropTypes.array,
        onScroll: PropTypes.func,
    };

    render() {
        const { galleries, withList, onScroll } = this.props;
        const half = !withList;
        // Save all the galleries
        const galleriesJSX = galleries && (
            <div className="row tiles">
                {galleries.map((gallery, i) => (
                    <GalleryCell gallery={gallery} half={half} key={i} />
                ))}
            </div>
        );

        // Check if a list is needed
        if (!half) {
            return (
                <div
                    className="container-fluid grid"
                    onScroll={onScroll}
                    ref={(r) => { this.grid = r; }}
                >
                    <div className="col-md-8">{galleriesJSX}</div>

                    <SuggestionList />
                </div>
            );
        }
        // No list needed
        return (
            <div
                className="container-fluid grid"
                onScroll={onScroll}
                ref={(r) => { this.grid = r; }}
            >
                {galleriesJSX}
            </div>
        );
    }
}

export default List;

