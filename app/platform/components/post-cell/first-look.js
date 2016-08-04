import React, { PropTypes, Component } from 'react';

/**
 * Post Cell First look item
 */
class FirstLook extends Component {

    constructor(props) {
        super(props);

        const { post } = props;

        this.state = { 
            purchased: post.purchased
        }

        this.createFirstLook = this.createFirstLook.bind(this);
    }

    createFirstLook() {
        const { post } = this.props;
        let firstLook;
        let firstLookIntervalId;
        if (!post.first_look_until) return {};
        const diffMs = moment(post.first_look_until).diff(moment());
        // const diffMs = moment().add(20, 'seconds').diff(moment());

        if (diffMs > 1) {
            firstLook = moment.duration(diffMs);
            firstLookIntervalId = setInterval(() => {
                if (this.state.firstLook && this.state.firstLook.asSeconds() <= 0) {
                    clearInterval(this.state.firstLookIntervalId);
                    this.setState({ firstLook: null, firstLookIntervalId: null });
                } else {
                    this.setState({ firstLook: this.state.firstLook.subtract(1, 's') });
                }
            }, 1000);
        }

        return { firstLook, firstLookIntervalId };
    }

    renderFirstLook() {
        const { firstLook } = this.state;
        if (!firstLook) return '';

        {firstLook
            ? this.renderFirstLook()
            : <span className="md-type-caption timestring" data-timestamp={time}>
                {timeString}
            </span>
        }

        return (
            <span className="tile--first-look">
                <i className="mdi mdi-clock-fast" />
                <span>{`${firstLook.minutes()}:${firstLook.seconds()} remaining`}</span>
            </span>
        );
    }

}

FirstLook.defaultProps = {
    post: {},
};

export default FirstLook;
