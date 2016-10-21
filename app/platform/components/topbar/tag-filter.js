import React from 'react';
import Tag from '../global/tag';
import Dropdown from '../global/dropdown';

export default class TagFilter extends React.Component {
    state = { toggled: false }

    handleTagInput = (e) => {
        //Call on tag input function if passed as a prop
        if(this.props.onTagInput){
            this.props.onTagInput(this.refs.tagFilterInput.value);
        }
        //Otherwise interact normally
        else {
            if(e.keyCode != 13) return;

            const tagText = this.refs.tagFilterInput.value;

            if(!tagText.length || this.props.filterList.indexOf(tagText) !== -1)
                return;

            this.props.onTagAdd(tagText);
            this.refs.tagFilterInput.value = '';
        }

    }

    render() {
        const { tagList, filterList, text } = this.props;

        const filtered = filterList.map((tag, i) => {
            return (
                <Tag
                    onClick={this.props.onTagRemove.bind(null, tag, i)}
                    text={tag}
                    key={i}
                />
            )
        });

        const available = tagList.map((tag, i) => {
            return (
                <Tag
                    onClick={this.props.onTagAdd.bind(null, tag, i)}
                    plus={true}
                    text={tag}
                    key={i}
                />
            )
        });

        return (
            <Dropdown
                title={filtered.length > 0 ? 'Filtering ' + filtered.length : ('Any ' + text)}
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
                                    ref="tagFilterInput"
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

TagFilter.defaultProps = {
    text: 'Tags',
    tagList: [],
    filterList: [],
    onTagAdd: function() {},
    onTagRemove: function() {}
}

