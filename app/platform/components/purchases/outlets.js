import React, { PropTypes } from 'react';
import moment from 'moment';
import update from 'react-addons-update';
import { DragDropContext } from 'react-dnd';
import pickBy from 'lodash/pickBy';
import difference from 'lodash/difference';
import last from 'lodash/last';
import HTML5Backend from 'react-dnd-html5-backend';
import api from 'app/lib/api';
import OutletColumn from './outlet-column.js';

// TODO: bring back map of outlets here
// TODO: move purchase loading here, make part of outlets map
// TODO: only load new outlets on outletId prop change
// TODO: use update on outlets object in onMove cb function
// TODO: fix draggable style (not showing dragged column with purchases)
// TODO: add horizontal scroll
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

    onScrollPurchases = (outlet) => {
        let { outlets = {} } = this.state;

        this.loadPurchases(last(outlet.purchases).id, (res) => {
            outlets = update(outlets, {
                [outlet.id]: { purchases: { $push: res } },
            });
        });
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

    /**
     * loadOutlets
     * loads outlet info and purchases for new outlet ids props
     *
     * @param {array} outletIds array of outlet ids
     */
    loadOutlets = (outletIds) => {
        let { outlets = {} } = this.state;
        let newOutletIds = outletIds;
        if (Object.keys(outlets).length) {
            newOutletIds = difference(outletIds, Object.keys(outlets));
        }
        if (!newOutletIds || !newOutletIds.length) return;

        Promise.all(newOutletIds.map((id) => api.get(`outlet/${id}`)))
        .then(res => {
            res.forEach((o) => {
                outlets = update(outlets, { [o.id]: { $set: o } });
            });
        })
        .catch(() => {
            $.snackbar({ content: 'There was an error loading outlets' });
        })
        .then(() => this.setState({ outlets }, () => this.loadPurchases(newOutletIds)));
    }

    loadPurchases = (outletIds, lastPurchase) => {
        let { outlets = {} } = this.state;

        Promise.all(outletIds.map((id) => api.get('purchase/list', {
            outlet_ids: [id],
            limit: 5,
            last: lastPurchase,
        })))
        .then(res => {
            res.forEach((purchases) => {
                if (purchases && purchases.length) {
                    outlets = update(outlets, {
                        [purchases[0].outlet_id]: { $merge: { purchases } },
                    });
                }
            });
        })
        .catch((err) => {
            if (err) debugger;
            $.snackbar({
                content: `There was an error getting outlets(${outletIds.join(', ')}) purchases!`,
            });
        })
        .then(() => this.setState({ outlets }));
    }

    render() {
        const { outlets } = this.state;
        return (
            <div className="purchases__outlets">
                {Object.keys(outlets).map((outletId, i) => (
                    <OutletColumn
                        key={i}
                        outlet={outlets[outletId]}
                        since={this.getTimeInterval(this.props.statsTime)}
                        onScrollPurchases={this.onScrollPurchases}
                        draggable
                    />
                ))}
            </div>
        );
    }
}

export default DragDropContext(HTML5Backend)(PurchasesOutlets);

