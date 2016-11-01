import React, { PropTypes } from 'react';
import moment from 'moment';
import update from 'react-addons-update';
import { DragDropContext } from 'react-dnd';
import difference from 'lodash/difference';
import last from 'lodash/last';
import HTML5Backend from 'react-dnd-html5-backend';
import api from 'app/lib/api';
import OutletColumn from './outlet-column.js';

// TODO: fix draggable style (not showing dragged column with purchases)
class PurchasesOutlets extends React.Component {
    static propTypes = {
        statsTime: PropTypes.string.isRequired,
        outletIds: PropTypes.array.isRequired,
    };

    state = {
        outlets: [],
        loading: false,
    }

    componentDidMount() {
        this.loadOutlets(this.props.outletIds);
    }

    componentWillReceiveProps(nextProps) {
        const { outletIds } = nextProps;
        let { outlets } = this.state;

        if (JSON.stringify(outletIds) !== JSON.stringify(this.props.outletIds)) {
            // get newly added outlet ids to then load them
            outlets = outlets.filter(o => outletIds.includes(o.id));
            let newOutletIds = outletIds;
            if (outlets.length) newOutletIds = difference(outletIds, outlets.map(o => o.id));
            this.setState({ outlets }, () => this.loadOutlets(newOutletIds));
        }
    }

    onMove = (dragIndex, hoverIndex) => {
        const { outlets } = this.state;
        const dragOutlet = outlets[dragIndex];

        this.setState(update(this.state, {
            outlets: {
                $splice: [
                    [dragIndex, 1],
                    [hoverIndex, 0, dragOutlet],
                ],
            },
        }));
    }

    /**
     * loadOutlets
     * loads outlet info and purchases for new outlet ids props
     *
     * @param {array} outletIds array of outlet ids
     */
    loadOutlets = (outletIds) => {
        let { outlets = [], loading } = this.state;
        if (loading || !outletIds || !outletIds.length) return;

        this.setState({ loading: true });
        Promise.all(outletIds.map((id) => api.get(`outlet/${id}`)))
        .then(res => {
            res.forEach(o => { outlets = update(outlets, { $push: [o] }); });
        })
        .catch(() => {
            $.snackbar({ content: 'There was an error loading outlets' });
        })
        .then(() => this.setState({ outlets, loading: false },
            () => this.loadInitialPurchases(outletIds)));
    }

    loadInitialPurchases = (outletIds) => {
        let { outlets = [], loading } = this.state;
        if (loading || !outletIds || !outletIds.length) return;
        this.setState({ loading: true });

        Promise.all(outletIds.map((id) => api.get('purchase/list', {
            outlet_ids: [id],
            limit: 5,
        })))
        .then(res => {
            res.forEach((purchases) => {
                if (purchases && purchases.length) {
                    const outletIdx = outlets.findIndex(o => o.id === purchases[0].outlet_id);
                    outlets = update(outlets, { [outletIdx]: { $merge: { purchases } } });
                }
            });
        })
        .catch(() => {
            $.snackbar({
                content: `There was an error getting outlets(${outletIds.join(', ')}) purchases!`,
            });
        })
        .then(() => this.setState({ outlets, loading: false }));
    }

    loadMorePurchases = (outletId) => {
        let { outlets = [], loading } = this.state;
        if (loading || !outletId) return;
        this.setState({ loading: true });
        const outletIdx = outlets.findIndex(o => o.id === outletId);
        const outlet = outlets[outletIdx];

        api.get('purchase/list', {
            outlet_ids: [outletId],
            last: last(outlet.purchases).id,
            limit: 5,
        })
        .then(res => {
            if (res && res.length) {
                outlets = update(outlets, { [outletIdx]: { purchases: { $push: res } } });
            }
        })
        .catch(() => {
            $.snackbar({
                content: `There was an error getting outlet(${outletId}) purchases!`,
            });
        })
        .then(() => this.setState({ outlets, loading: false }));
    }

    render() {
        const { outlets } = this.state;
        return (
            <div className="purchases__outlets">
                {outlets.map((outlet, i) => (
                    <OutletColumn
                        key={outlet.id}
                        id={outlet.id}
                        index={i}
                        outlet={outlet}
                        statsTime={this.props.statsTime}
                        loadMorePurchases={this.loadMorePurchases}
                        onMove={this.onMove}
                        draggable
                    />
                ))}
            </div>
        );
    }
}

export default DragDropContext(HTML5Backend)(PurchasesOutlets);

