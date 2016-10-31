import React, { PropTypes } from 'react';

export default class APITokens extends React.Component {
    onTokenNameKeyDown = (e) => {
		if (e.keyCode != 13) return;

        console.log('token name', this.tokenName.value);
    }

    render() {
        return (
            <div className="card">
                <div className="header">
                    <span className="title">API Tokens</span>
                </div>

                <div className="api-tokens__body">
                </div>

                <div className="footer">
                    <input type="text"
                        className="outlet-invite"
                        placeholder="New token name"
                        ref={r => { this.tokenName = r; }}
                        onKeyDown={this.onTokenNameKeyDown}
                    />
                </div>
            </div>
        );
    };
};

