import React, { PropTypes } from 'react';

export default class FitText extends React.Component {
    static propTypes = {
        defaultFontSize: PropTypes.number.isRequired,
        fitCharCount: PropTypes.number.isRequired,
        compressor: PropTypes.number,
        text: PropTypes.string,
        className: PropTypes.string,
    }

    static defaultProps = {
        compressor: 1,
        className: '',
    };

    getStyle() {
        const { fitCharCount, defaultFontSize, compressor, text } = this.props;
        let fontSize = defaultFontSize;

        if (text.length > fitCharCount) {
            const fontDiff = (text.length - fitCharCount) * 0.5 * compressor;
            fontSize -= fontDiff;
        }
        fontSize = `${fontSize}px`;

        return { fontSize };
    }

    render() {
        return (
            <span
                className={this.props.className}
                ref={(r) => { this.text = r; }}
                style={this.getStyle()}
            >
                {this.props.text}
            </span>
        );
    }
}

