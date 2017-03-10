import React, { PropTypes } from 'react';
import Tag from '../global/tag';
import Dropdown from '../global/dropdown';

export default class TagFilter extends React.Component {
    static propTypes = {
        onTagInput: PropTypes.func,
        onTagAdd: PropTypes.func,
        onTagRemove: PropTypes.func,
        filterList: PropTypes.array,
        tagList: PropTypes.array,
        text: PropTypes.string,
        attr: PropTypes.string,
        altAttr: PropTypes.string,
        hasAlt: PropTypes.bool,
    };

    static defaultProps = {
        text: 'Tags',
        tagList: [],
        filterList: [],
        onTagAdd() {},
        onTagRemove() {},
        hasAlt: false,
    };

    state = { toggled: false };

    handleTagInput = (e) => {
        const { onTagInput, onTagAdd, filterList } = this.props;
        // Call on tag input function if passed as a prop
        if (onTagInput) {
            onTagInput(this.tagFilterInput.value);
        } else {
            // Otherwise interact normally
            if (e.keyCode !== 13) return;

            const tagText = this.tagFilterInput.value;

            if (!tagText.length || filterList.indexOf(tagText) !== -1) return;

            onTagAdd(tagText);
            this.tagFilterInput.value = '';
        }
    };

    render() {
        const {
            tagList,
            filterList,
            text,
            onTagAdd,
            onTagRemove,
            attr,
            altAttr,
            hasAlt,
        } = this.props;

        const filtered = filterList.map((tag, i) => (
            <Tag
                onClick={() => onTagRemove(tag, i)}
                text={attr ? tag[attr] : tag}
                altText={altAttr ? tag[altAttr] : ''}
                key={i}
                hasAlt={hasAlt}
            />
        ));

        const available = tagList.map((tag, i) => (
            <Tag
                onClick={() => onTagAdd(tag, i)}
                text={attr ? tag[attr] : tag}
                altText={altAttr ? tag[altAttr] : ''}
                key={i}
                hasAlt={hasAlt}
                plus
            />
        ));

        return (
            <Dropdown
                title={filtered.length > 0 ? `Filtering ${filtered.length}` : `Any ${text}`}
                dropdownClass="tags-dropdown"
                inList
            >
                <div className="chips">
                    <div className="split-cell">
                        <div className="form-group-default">
                            <div className="form-control-wrapper">
                                <input
                                    id="tag-filter-input"
                                    type="text"
                                    className="form-control floating-label"
                                    placeholder={text}
                                    ref={r => { this.tagFilterInput = r; }}
                                    onKeyUp={this.handleTagInput}
                                />
                            </div>
                        </div>

                        <ul id="tag-filter" className="chips">
                            {filtered}
                        </ul>
                    </div>

                    {available.length > 0 ?
                        <div className="split-cell">
                            <span className="md-type-body2">{`Available ${text}`}</span>
                            <ul id="filter-available" className="chips">{available}</ul>
                        </div>
                        :
                        ''
                    }
                </div>
            </Dropdown>
        );
    }
}
