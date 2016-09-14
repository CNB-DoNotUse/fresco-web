import React, { PropTypes } from 'react';
import moment from 'moment';
import update from 'react-addons-update';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import api from 'app/lib/api';
import OutletColumn from './outlet-column.js';

class PurchasesOutlets extends React.Component {
    static propTypes = {
        statsTime: PropTypes.string.isRequired,
        outletIds: PropTypes.array.isRequired,
    };

    state = {
        outlets: {},
    }

    componentDidMount() {
        this.loadOutlets(this.props.outletIds);
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
            api.get(`outlet/${id}`)
            .then(res => {
                this.setState({
                    outlets: update(this.state.outlets, { [id]: { $set: res } }),
                });
            })
            .catch(() => {
                $.snackbar({ content: 'There was an error loading outlets' });
            });
        });
    }

    render() {
        return (
            <div className="purchases__outlets">
                {Object.keys(this.state.outlets).map((outletId, i) => (
                    <OutletColumn
                        outlet={this.state.outlets[outletId]}
                        since={this.getTimeInterval(this.props.statsTime)}
                        key={i}
                        draggable
                    />
                ))}
            </div>
        );
    }
}

export default DragDropContext(HTML5Backend)(PurchasesOutlets);

