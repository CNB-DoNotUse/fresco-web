import React from 'react'
import Dropdown from '../global/dropdown'

export default class TimeToggle extends React.Component {
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

        console.log("Selected: " + selected);

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
        for (let option of ['Relative','Absolute']) {
            console.log(option + " " + this.state.selected);
            radioButtons.push(
                <div className="radio" key={option}>
                    <label>
                        <input
                            type="radio"
                            name="timeToggle"
                            value={option}
                            onClick={this.optionClicked}
                            defaultChecked={option === this.state.selected} />
                        <span className="radio-label">{option}</span>
                    </label>
                </div>
            );
        }

        return (
            <div className="form-group">
                {radioButtons}
            </div>
        );
    }
}

TimeToggle.defaultProps = {
    onSelected: function() {}
}
