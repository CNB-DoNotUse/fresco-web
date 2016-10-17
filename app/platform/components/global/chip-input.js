import React, { PropTypes } from 'react';
import reject from 'lodash/reject';
import capitalize from 'lodash/capitalize';
import api from 'app/lib/api';
import Tag from '../global/tag';

/**
 * AutocompletChipInput
 *
 * @extends React.Component
 */
class ChipInput extends React.Component {

    static propTypes = {
        items: PropTypes.array.isRequired,
        updateItems: PropTypes.func.isRequired,
        model: PropTypes.string.isRequired,
        attr: PropTypes.string,
        initMaterial: PropTypes.bool,
        className: PropTypes.string,
        autocomplete: PropTypes.bool,
        createNew: PropTypes.bool,
        multiple: PropTypes.bool,
        placeholder: PropTypes.string,
    };

    static defaultProps = {
        items: [],
        initMaterial: false,
        className: '',
        autocomplete: false,
        createNew: true,
        multiple: true,
    };

    state = {
        suggestions: [],
        query: '',
    };

    componentWillMount() {
        document.addEventListener('click', this.onClick);
    }

    componentDidMount() {
        if (this.props.initMaterial) {
            $.material.init();
        }
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
        const { model, attr, autocomplete } = this.props;
        this.setState({ query });
        if (!autocomplete || !attr) return;

        // Enter is pressed, and query is present
        if (!query.length === 0) {
            this.setState({ suggestions: [] });
        } else {
            api
            .get('search', { [`${model}[a][${attr}]`]: query })
            .then(res => {
                if (res[model] && res[model].results) {
                    this.setState({ suggestions: res[model].results });
                }
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
        const { attr, autocomplete, createNew } = this.props;
        const { suggestions, query } = this.state;

        if (e.keyCode === 13 && query.length > 0) {
            const matched = autocomplete && suggestions.find((s) => (
                s.title.toLowerCase() === query.toLowerCase()
            ));

            if (!attr) {
                this.addItem(query);
                return;
            }

            if (!matched && !createNew) return;

            this.addItem(matched || { [attr]: query });
        }
    }

    /**
     * Adds story element, return if story exists in prop stories.
     */
    addItem(newItem) {
        let { items, attr, multiple } = this.props;

        if (attr) {
            if (!newItem[attr] || !newItem[attr].length) return;
            if (newItem.id && items.some((i) => (i.id === newItem.id))) return;
        } else if (items.some(i => i === newItem)) return;

        if (multiple) items = items.concat(newItem);
        else items = [newItem];

        this.setState({ query: '' }, this.props.updateItems(items));
    }

    /**
     * Removes story and updates to parent
     */
    removeItem(item) {
        let { items, attr } = this.props;

        if (!attr) items = items.filter(i => i !== item);
        else if (item.id) items = reject(items, { id: item.id });
        else items = reject(items, { [attr]: item[attr] });

        this.props.updateItems(items);
    }

    render() {
        const { query, suggestions } = this.state;
        const { items, attr, model, placeholder } = this.props;
        const itemsJSX = items.map((item, i) => (
            <Tag
                text={attr ? item[attr] : item}
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
                ref={r => this.area = r}
                className={`split chips form-group-default ${this.props.className}`}
            >
                <div className="split-cell">
                    <input
                        type="text"
                        className="form-control floating-label"
                        placeholder={placeholder || capitalize(model)}
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

export default ChipInput;

