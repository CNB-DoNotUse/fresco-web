import React, { PropTypes } from 'react';
import Tag from '../global/tag.js';

/**
 * Component for managing added/removed tags
 */
class EditOutlet extends React.Component {
    constructor(props) {
        super(props);
        this.state = { suggestions: [] };
    }

    change() {
        // Current fields input
        const query = this.refs.autocomplete.value;

        // Field is empty
        if (query.length === 0) {
            this.setState({ suggestions: [] });
            this.refs.dropdown.style.display = 'none';
        } else {
            this.refs.dropdown.style.display = 'block';

            $.ajax({
                url: '/api/search?outlets=true',
                data: { q: query },
            })
            .done((res) => {
                if (res && res.outlets) this.setState({ suggestions: res.outlets.results });
            });
        }
    }

	/**
	 * Adds outlet at passed index to current outlet
	 * @param {[type]} index [description]
	 */
    addOutlet(outlet) {
        if (this.props.outlet) {
            $.snackbar({ content: 'Outlets can only have one owner!' });
            return;
        }

        // Clear the input field
        this.refs.autocomplete.value = '';
        this.refs.dropdown.style.display = 'none';

        // Send outlet up to parent
        this.props.updateOutlet(outlet);
    }

    renderOutlet() {
        const { outlet, updateOutlet } = this.props;
        if (!outlet) return '';

        return (
            <Tag
                text={outlet.title}
                onClick={() => updateOutlet()}
                plus={false}
            />
        );
    }

    // Map suggestions for dropdown
    renderSuggestions() {
        const { suggestions } = this.state;
        if (!suggestions || !suggestions.length) return '';

        return suggestions.map((outlet, i) => (
            <li onClick={() => this.addOutlet(outlet)} key={i}>{outlet.title}</li>
        ));
    }

    render() {
        return (
            <div className="dialog-row split chips">
                <div className="split-cell">
                    <input
                        type="text"
                        className="form-control floating-label"
                        placeholder="Owner (Outlet)"
                        onKeyUp={() => this.change()}
                        ref="autocomplete"
                    />

                    <ul ref="dropdown" className="dropdown">
                        {this.renderSuggestions()}
                    </ul>

                    <ul className="chips">
                        {this.renderOutlet()}
                    </ul>
                </div>
            </div>
        );
    }
}

EditOutlet.propTypes = {
    outlet: PropTypes.object,
    updateOutlet: PropTypes.func,
};

EditOutlet.defaultProps = {
    updateOutlet: () => {},
};

export default EditOutlet;

