import React from 'react'

/**
 * Generic group of (styled) radio buttons
 * @param {function} onSelected  A function called with the user's selection
 * @param {Array}    options     The options that are available to select from
 * @param {string}   name        The name to give the radio button controls
 * @param {string}   selected    The pre-selected option (if any)
 */

export default class RadioGroup extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selected: this.props.selected
        }

        this.optionClicked = this.optionClicked.bind(this);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.selected != this.props.selected) {
            this.setState({
                selected: this.props.selected
            });
        }
    }

    optionClicked(e) {
        var selected = e.currentTarget.value;

        // Ignore if option was already selected
        if (this.state.selected == selected) {
            return;
        }

        this.setState({
            selected: selected
        });

        if (this.props.onSelected) {
            this.props.onSelected(selected);
        }
    }

    render() {
        let radioButtons = [];
        for (let option of this.props.options) {
            radioButtons.push(
                <li className="radio" key={option}>
                    <label>
                        <input
                            type="radio"
                            name={this.props.name}
                            value={option}
                            onClick={this.optionClicked}
                            defaultChecked={option === this.state.selected} />
                        <div className="radio-label">{option}</div>
                    </label>
                </li>
            )
        }

        return (
            <div className="list">
                <li className="header">
                    Display:
                </li>
                {radioButtons}
            </div>
        );
    }
}

RadioGroup.defaultProps = {
    onSelected: function() {},
    name: 'FACADE5'
};
