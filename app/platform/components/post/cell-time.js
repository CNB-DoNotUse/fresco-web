import React, { PropTypes, Component } from 'react';
import moment from 'moment';
import utils from 'utils';

/**
 * Post Cell Time/First Look
 */
class CellTime extends Component {

    constructor(props) {
        super(props);

        this.state = { ...this.createFirstLook() };
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

    render() {
        const { post, sort } = this.props;
        const { firstLook } = this.state;
        const time = sort === 'captured_at'
            ? (post.captured_at || post.created_at)
            : post.created_at;
        const timeString = typeof(time) === 'undefined' ? 'No timestamp' : utils.formatTime(time);
        const pad = (num, size) => (`000000000${num}`).substr(-size);

        if (firstLook) {
            return (
                <span className="tile--first-look">
                    <i className="mdi mdi-clock-fast" />
                    <span>{`${pad(firstLook.minutes(), 2)}:${pad(firstLook.seconds(), 2)} remaining`}</span>
                </span>
            );
        }

        return (
            <span className="md-type-caption timestring" data-timestamp={time}>
                {timeString}
            </span>
        );
    }
}

CellTime.propTypes = {
    post: PropTypes.object,
    sort: PropTypes.string,
};

CellTime.defaultProps = {
    post: {},
    sort: 'captured_at',
};

export default CellTime;