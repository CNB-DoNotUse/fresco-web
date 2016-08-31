import React, { PropTypes } from 'react';
import moment from 'moment';
import update from 'react-addons-update';
import OutletColumn from './outlet-column.js';

export default class PurchasesOutlets extends React.Component {
    static propTypes = {
        statsTime: PropTypes.string.isRequired,
        outletIds: PropTypes.array.isRequired,
    };

    state = {
        outlets: {},
    }

    componentDidMount() {
        this.loadOutlets();
    }

    componentWillReceiveProps(nextProps) {
        if (JSON.stringify(nextProps.outletIds) !== JSON.stringify(this.props.outletIds)) {
            this.loadOutlets(nextProps.outletIds);
        }
    }

    /**
     * Updates the time interval the outelt data is loaded in
     * @return {moment} Moment.JS Object for the selected time
     */
    getTimeInterval = (selected) => {
        switch (selected) {
            case 'today so far':
                return moment().utc().startOf('day');
            case 'last 24 hours':
                return moment().utc().subtract(1, 'day');
            case 'last 7 days':
                return moment().utc().subtract(7, 'days');
            case 'last 30 days':
                return moment().utc().subtract(30, 'days');
            case 'this year':
                return moment().utc().subtract(1, 'year');
            case 'all time':
                return null;
            default:
                return moment().utc().startOf('day')
        }
    }

    loadOutlets(outletIds = []) {
        // Loop through, and update state on each response
        outletIds.forEach((id) => {
            $.ajax({
                url: '/api/outlet/get',
                type: 'GET',
                data: { id },
                dataType: 'json',
            })
            .done(response => {
                this.setState({
                    outlets: update(this.state.outlets, { [id]: { $set: response.data } }),
                });
            });
        });
    }

    render() {
        return (
            <div className="outletStats">
                {Object.keys(this.state.outlets).map((outlet, i) => (
                    <OutletColumn
                        outlet={this.state.outlets[outlet]}
                        since={this.getTimeInterval(this.props.statsTime)}
                        key={i}
                    />
                ))}
            </div>
        );
    }
}

