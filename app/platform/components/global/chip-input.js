import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import reject from 'lodash/reject';
import capitalize from 'lodash/capitalize';
import utils from 'utils';
import get from 'lodash/get';
import api from 'app/lib/api';
import Tag from '../global/tag';

/**
 * Autocomplet Chip Input
 * This component handles the input handling and suggestion loading for all
 * chip inputs on the site. A variety of suggestion methods can be passed,
 * including the ability to pass a prop function for loading initial suggestions
 * without a query.
 *
 * @extends React.Component
 */
class ChipInput extends React.Component {

    static propTypes = {
        items: PropTypes.array.isRequired,
        updateItems: PropTypes.func.isRequired,
        modifyText: PropTypes.func,
        model: PropTypes.string.isRequired,
        queryAttr: PropTypes.string,
        altAttr: PropTypes.string,
        initMaterial: PropTypes.bool,
        className: PropTypes.string,
        autocomplete: PropTypes.bool,
        createNew: PropTypes.bool,
        multiple: PropTypes.bool,
        idLookup: PropTypes.bool,
        search: PropTypes.bool,
        disabled: PropTypes.bool,
        placeholder: PropTypes.string,
        params: PropTypes.object
    };

    static defaultProps = {
        items: [],
        params: {},
        initMaterial: false,
        className: '',
        autocomplete: false,
        search: false,
        createNew: true,
        multiple: true,
        disabled: false,
        suggestionText: 'Suggestions',
        modifyText(t) { return t; }
    };

    state = {
        suggestions: [],
        query: '',
        showingInitial: false
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

    /**
     * Handles click event from dom listener. Determines if click is outside of the modal
     */
    onClick = () => {
        const domNode = ReactDOM.findDOMNode(this.refs.chipInput);
        if ((!domNode || !domNode.contains(event.target))) {
            this.setState({ suggestions: [] });
        }
    };

    /**
     * Listener for whenever the input field changes for the chip input
     */
    onChangeQuery = (e) => {
        const query = e.target.value;

        if (query.length === 0 || utils.isEmptyString(query)) {
            this.getInitialSuggestions();
            this.setState({ query });
        } else {
            this.setState({ query }, () => {
                //On callback so we can make sure we have the new query to get suggestions with
                this.getSuggestions();
            });
        }
    };

    /**
     * On key up event on the input field. The chip input can handle either adding existing items
     * that are found from the look up, or just simply adding what the user inputs into the text field, think 
     * `tags`. Assignments, galleries, stories however will likely require that a matching item is found.
     * See the logic below
     * @param {object} e Key up event
     */
    onKeyUpQuery = (e) => {
        const { queryAttr, altAttr, createNew } = this.props;
        const { suggestions, query } = this.state;
        const keyCode = e.keyCode;

        //If we're hitting escape, or we're hitting backspace and there's no query
        if(e.keyCode === 27 || ( (e.keyCode === 8 || e.keyCode === 46) && query.length === 0 )) {
            this.setState({ suggestions: [] });
        } else if (e.keyCode === 13 && query.length > 0) {
            //If we're not querying by anything, add the whole object
            if (!queryAttr) {
                this.addItem(query);
            } else {            
                const matched = suggestions.find(s => (
                    s[queryAttr] && (s[queryAttr].toLowerCase() === query.toLowerCase())
                )) || suggestions[0];

                //Check if we're creating new items or existing ones
                if (createNew) {
                    if(altAttr) {
                        this.addItem({ 
                            [queryAttr]: query, 
                            [altAttr]: query,
                             new: true 
                         });
                    } else {
                        this.addItem({ 
                            [queryAttr]: query, 
                            new: true 
                        });
                    }
                } else if (matched) {
                    this.addItem(matched);
                }
            }
        }
    };

    /**
     * On click handler for the main input field
     */
    onInputClick = (e) => {
        let { query } = this.state;

        if (query.length === 0 || utils.isEmptyString(query)) {
            this.getInitialSuggestions();
        }
    };

    /**
     * Gets suggestions to fill the chip input with based on the model passed.
     * The search for suggestions is based on the type of 
     * suggestoon method passed e.g. autocomplete, search, or a lookup my model ID
     */
    getSuggestions = () => {
        let _this = this;
        const {
            model,
            queryAttr,
            autocomplete,
            idLookup,
            search,
            params
        } = this.props;
        const { query } = this.state;

        if (search) {
            api
            .get('search', { 
                [`${model}[q]`]: query, 
                ...params 
            })
            .then(handleResponse);
        } else if (autocomplete) {
            api
            .get('search', { 
                [`${model}[a][${queryAttr}]`]: query, 
                ...params 
            })
            .then(handleResponse);
        } else if (idLookup) {
            this.getModelById(query);
        }

        //Handles response for us
        function handleResponse(res){
            if (get(res, `${model}.results.length`)) {
                _this.setState({ suggestions: res[model].results, showingInitial: false });
            } else if(idLookup) {
                _this.getModelById(query);
            } else {
                //Fallback to clearing suggestions
                _this.setState({ suggestions: [], showingInitial: false });
            }
        }
    };

    /**
     * Fetches initial suggestions if a function is passed to do
     */
    getInitialSuggestions = () => {
        if(this.props.initialSuggestions) {
            this.props.initialSuggestions((suggestions) => {
                this.setState({ suggestions, showingInitial: true })
            });
        } else {
            this.setState({ suggestions: [], showingInitial: false });
        }
    }

    /**
     * Does a lookup of a model by its ID, if found, will set in state
     * @param  {String} id The ID of the model to look up with
     */
    getModelById(id) {
        const { model } = this.props;
        api
        .get(`${utils.pluralToSingularModel(model)}/${id}`)
        .then((res) => {
            if (res) this.setState({ suggestions: [res] });
        })
        .catch(err => err);
    }

    /**
     * Adds story element, return if story exists in prop stories.
     */
    addItem(newItem) {
        let { 
            items, 
            queryAttr, 
            multiple, 
            altAttr 
        } = this.props;

        //Run checks to make sure we don't already have the item
        if (queryAttr) {
            if (!newItem[queryAttr] && !newItem[altAttr]) 
                return;
            if (newItem.id && items.some((i) => (i.id === newItem.id))) 
                return;
        } else if (items.some(i => i === newItem)) {
            return;
        }

        if (multiple) {
            items = items.concat(newItem);
        } else {
            items = [newItem];
        }

        //Reset query, and send items to parent
        this.setState({ query: '', suggestions: [] }, () => this.props.updateItems(items));
    }

    /**
     * Removes tag and updates to parent
     * @param {Object} item The item that is being clicked
     */
    onClickTag = (item) => {
        if (this.props.disabled) return;
        let { items, queryAttr } = this.props;

        if (!queryAttr) {
            items = items.filter(i => i !== item);
        } else if (item.id) {
            items = reject(items, { id: item.id });
        } else {
            items = reject(items, { [queryAttr]: item[queryAttr] });
        }

        //Update parent with new items
        this.props.updateItems(items);
    };

    /**
     * Text modifier used by parent cmp. if it wishes to modify
     * the text string that shows up. Returns text by default via `defaultProps`    
     * @param  {String} text The text that is about show up
     * @return {String} Modified version of the text
     */
    modifyText(text) {
        return this.props.modifyText(text);
    }

    /**
     * Renders suggestion in dropdown
     * @param  {Object} suggestion Passed suggestion object
     * @param  {Integer} key Index/key of the suggestion in the state's suggestions
     * @return {JSX} React JSX cmp. representing the suggestion to render
     */
    renderSuggestion = (suggestion, key) => {
        const { queryAttr, altAttr } = this.props;
        let text;
        if (!altAttr) {
            text = suggestion[queryAttr];
        } else if (suggestion[queryAttr]) {
            text = (
                <span className="chip__primary-text">
                    {`${suggestion[queryAttr]} `}
                    <span className="chip__alt-text">
                        {suggestion[altAttr] || ''}
                    </span>
                </span>
            );
        } else if (suggestion[altAttr]) {
            text = (
                <span className="chips__primary-text" >
                    {suggestion[altAttr]}
                </span>
            );
        }

        return (
            <li 
                onClick={() => this.addItem(suggestion)} 
                key={key}
            >
                {text}
            </li>
        );
    }

    render() {
        const { query, suggestions, showingInitial } = this.state;
        const { items, queryAttr, altAttr, model, placeholder, disabled } = this.props;
        const itemsJSX = items.map((item, i) => {
            const text = queryAttr ? item[queryAttr] : item;

            return (
                <Tag
                    text={this.modifyText(text)}
                    altText={altAttr ? item[altAttr] : ''}
                    plus={false}
                    onClick={() => this.onClickTag(item)}
                    key={i}
                    hasAlt={!!altAttr}
                />
            );
        });

        return (
            <div
                ref='chipInput'
                className={`split chips form-group-default ${this.props.className}`}
            >
                <div className="split-cell">
                    <input
                        type="text"
                        className="form-control floating-label"
                        placeholder={placeholder || capitalize(model)}
                        onClick={this.onInputClick}
                        onChange={this.onChangeQuery}
                        onKeyUp={this.onKeyUpQuery}
                        value={query}
                        disabled={disabled}
                    />

                    <ul className={`dropdown ${suggestions.length > 0 ? 'show' : ''}`}>
                        {showingInitial && 
                            <h4 className="dropdown__suggestion_header">{this.props.suggestionText}</h4>}
                        
                        {suggestions.map(this.renderSuggestion)}
                    </ul>

                    <ul className="chips">{itemsJSX}</ul>
                </div>
            </div>
        );
    }
}

export default ChipInput;