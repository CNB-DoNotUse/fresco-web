import React, { PropTypes } from 'react';

const testProps = {
    outlet: {
        tokens: [
            { name: 'Blue token' },
            { name: 'Green token' },
            { name: 'Red token' },
            { name: 'Yellow token' },
        ],
    },
};

const stateFromProps = (props) => ({
    tokens: props.outlet.tokens.map(t => Object.assign(t, { active: false }))
});

export default class APITokens extends React.Component {
    static propTypes = {
        outlet: PropTypes.object,
    };

    state = stateFromProps(testProps);

    onTokenNameKeyDown = (e) => {
		if (e.keyCode != 13) return;
        const name = this.tokenName.value;
        const { tokens } = this.state;

        if (tokens.some(t => t.name === name)) return;

        this.setState({
            tokens: tokens.concat({ name, selected: false }),
        });
    }

    onClickSelectAll = (e) => {
        const tokens = this.state.tokens.map(t => Object.assign(t, { active: true }));
        this.setState({ tokens });
    }

    render() {
        const { tokens } = this.state;

        return (
            <div className="card api-tokens__card">
                <div className="header">
                    <span className="title">API Tokens</span>
                </div>

                <div className="api-tokens__body">
                </div>

                <div className="footer api-tokens__footer">
                    <input
                        type="text"
                        className="api-tokens__input"
                        placeholder="New token name"
                        ref={r => { this.tokenName = r; }}
                        onKeyDown={this.onTokenNameKeyDown}
                    />

                    <div className="api-tokens__options">
                        <div className="checkbox check-fresco">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={tokens.every(t => t.active)}
                                    onClick={this.onClickSelectAll}
                                />
                            </label>
                        </div>
                    </div>

                    <span className="api-tokens__select-all">SELECT ALL:</span>
                </div>
            </div>
        );
    };
};

