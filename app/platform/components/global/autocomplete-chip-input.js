import React, { PropTypes } from 'react';
import Tag from '../global/tag';
import reject from 'lodash/reject';
import capitalize from 'lodash/capitalize';

/**
 * AutocompletChipInput
 *
 * @extends React.Component
 */
class AutocompletChipInput extends React.Component {

    static propTypes = {
        items: PropTypes.array.isRequired,
        updateItems: PropTypes.func.isRequired,
        attr: PropTypes.string.isRequired,
        model: PropTypes.string.isRequired,
    };

    static defaultProps = {
        items: [],
    };

    state = {
        suggestions: [],
        query: '',
    };

    componentWillMount() {
        document.addEventListener('click', this.onClick);
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.onClick);
    }

    onClick = (e) => {
        if (this.area && this.area.contains(e.target)) {
            return;
        }

        this.setState({ query: '' });
    }

    onChangeQuery = (e) => {
        const query = e.target.value;
        const { model, attr } = this.props;
        this.setState({ query });

        // Enter is pressed, and query is present
        if (!query.length === 0) {
            this.setState({ suggestions: [] });
        } else {
            $.ajax({
                url: '/api/search',
                data: { [`${model}[a][${attr}]`]: query },
                success: (res) => {
                    if (res[model] && res[model].results) {
                        this.setState({ suggestions: res[model].results });
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
    onKeyUpQuery = (e) => {
        const { attr } = this.props;
        const { suggestions, query } = this.state;

        if (e.keyCode === 13 && query.length > 0) {
            const matched = suggestions.find((s) => (
                s.title.toLowerCase() === query.toLowerCase()
            ));

            this.addItem(matched || { [attr]: query, newModel: true });
        }
    }

    /**
     * Adds story element, return if story exists in prop stories.
     */
    addItem(newItem) {
        let { items, attr } = this.props;
        if (!newItem[attr] || !newItem[attr].length) return;

        // Check if story already exists
        if (!newItem.newModel && items.some((i) => (i.id === newItem.id))) return;
        items = items.concat(newItem);

        this.setState({ query: '' }, this.props.updateItems(items));
    }

    /**
     * Removes story and updates to parent
     */
    removeItem(item) {
        let { items, attr } = this.props;
        items = reject(items, { [attr]: item[attr] });

        this.props.updateItems(items);
    }

    render() {
        const { query, suggestions } = this.state;
        const { items, attr, model } = this.props;
        const itemsJSX = items.map((item, i) => (
            <Tag
                text={item[attr]}
                plus={false}
                onClick={() => this.removeItem(item)}
                key={i}
            />
        ));

        const suggestionsJSX = suggestions.map((suggestion, i) => (
            <li onClick={() => this.addItem(suggestion)} key={i}>
                {suggestion[attr]}
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
                        placeholder={capitalize(model)}
                        onChange={this.onChangeQuery}
                        onKeyUp={this.onKeyUpQuery}
                        value={query}
                    />

                    <ul
                        style={{ display: `${query.length ? 'block' : 'none'}` }}
                        className="dropdown"
                    >
                        {suggestionsJSX}
                    </ul>

                    <ul className="chips">
                        {itemsJSX}
                    </ul>
                </div>
            </div>

        );
    }
}

export default AutocompletChipInput;

