import React, { PropTypes } from 'react';
import moment from 'moment';
import { DragDropContext } from 'react-dnd';
import pickBy from 'lodash/pickBy';
import difference from 'lodash/difference';
import HTML5Backend from 'react-dnd-html5-backend';
import api from 'app/lib/api';
import OutletColumn from './outlet-column.js';

// TODO: bring back map of outlets here
// TODO: only load new outlets on outletId prop change
// TODO: use update on outlets object in onMove cb function
// TODO: fix draggable style (not showing dragged column with purchases)
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
        const { outletIds } = nextProps;

        if (JSON.stringify(outletIds) !== JSON.stringify(this.props.outletIds)) {
            const outlets = pickBy(this.state.outlets, o => outletIds.includes(o.id));
            this.setState({ outlets }, () => this.loadOutlets(outletIds));
        }
    }

    onMove = ({ sourceOutletId, targetOutletId }) => {
        console.log('moving from', sourceOutletId, 'to', targetOutletId);
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

    loadOutlets = (outletIds) => {
        let { outlets = {} } = this.state;
        let newOutletIds = outletIds;
        if (Object.keys(outlets).length) {
            newOutletIds = difference(outletIds, Object.keys(outlets));
        }

        Promise.all(newOutletIds.map((id) => api.get(`outlet/${id}`)))
        .then(res => {
            res.forEach((o) => {
                outlets = Object.assign({}, outlets, { [o.id]: o });
            });
        })
        .catch(() => {
            $.snackbar({ content: 'There was an error loading outlets' });
        })
        .then(() => this.setState({ outlets }));
    }

    render() {
        const { outlets } = this.state;
        return (
            <div className="purchases__outlets">
                {Object.keys(outlets).map((outletId, i) => (
                    <OutletColumn
                        outlet={outlets[outletId]}
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

