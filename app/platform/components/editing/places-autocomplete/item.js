'use strict';

import React from 'react';

/**
 * Autocomplete list item
 * @prop {function} onSuggestionSelect - Called when place is selected. Returns place object
**/

export default class Item extends React.Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);

  }

  handleClick(event) {
    event.preventDefault();
    if (this.props.onSuggestSelect) {
      this.props.onSuggestSelect(this.props.suggest);
    }
  }

  render() {
    return (
      <li className={'geosuggest-item' + (this.props.isActive ? ' geosuggest-item--active' : '')} onClick={this.handleClick}>
        {this.props.suggest.label}
      </li>
    );
  }
}
