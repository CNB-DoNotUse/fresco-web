import React, { PropTypes } from 'react';
import Tag from '../global/tag.js';
import reject from 'lodash/reject';

/**
 * Component for managing added/removed tags
 */
class EditOutlets extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            query: '',
            suggestions: [],
        };
    }

    onChangeQuery(e) {
        // Current fields input
        const query = e.target.value;
        this.setState({ query });

        // Field is empty
        if (query.length === 0) {
            this.setState({ suggestions: [] });
        } else {
            $.ajax({
                url: '/api/search',
                data: { 'outlets[a][title]': query },
            })
            .done((res) => {
                if (res && res.outlets) this.setState({ suggestions: res.outlets.results });
            });
        }
    }

	/**
	 * Adds outlet at passed index to current outlet
     * Clears the input field
     * Sends outlets to parent cmp
	 * @param {[type]} index [description]
	 */
    addOutlet(outlet) {
        let { outlets } = this.props;
        if (!outlets.some((o) => o.id === outlet.id)) {
            outlets = outlets.concat(outlet);
        }

        this.setState({ query: '', outlets });
        this.props.updateOutlets(outlets);
    }

    removeOutlet(outlet) {
        let { outlets } = this.props;
        outlets = reject(outlets, { id: outlet.id });

        this.setState({ query: '', outlets });
        this.props.updateOutlets(outlets);
    }

    renderOutlet() {
        const { outlets } = this.props;
        if (!outlets || !outlets.length) return '';

        return outlets.map((o, i) => (
            <Tag
                key={i}
                text={o.title}
                onClick={() => this.removeOutlet(o)}
                plus={false}
            />
        ));
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
        const { query } = this.state;

        return (
            <div className="dialog-row split chips">
                <div className="split-cell">
                    <input
                        type="text"
                        className="form-control floating-label"
                        placeholder="Owner (Outlet)"
                        onChange={(e) => this.onChangeQuery(e)}
                        value={query}
                    />

                    <ul
                        style={{ display: `${query.length ? 'block' : 'none'}` }}
                        className="dropdown"
                    >
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

EditOutlets.propTypes = {
    outlets: PropTypes.array,
    updateOutlets: PropTypes.func.isRequired,
};

export default EditOutlets;

