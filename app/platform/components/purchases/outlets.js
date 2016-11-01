import React, { PropTypes } from 'react';
import moment from 'moment';
import update from 'react-addons-update';
import { DragDropContext } from 'react-dnd';
import difference from 'lodash/difference';
import last from 'lodash/last';
import filter from 'lodash/filter';
import pickBy from 'lodash/pickBy';
import HTML5Backend from 'react-dnd-html5-backend';
import api from 'app/lib/api';
import { getFromStorage, setInStorage } from 'app/lib/storage';
import OutletColumn from './outlet-column.js';

const getFromPurchasesStorage = getFromStorage('purchases');
const setInPurchasesStorage = setInStorage('purchases');

// TODO: fix draggable style (not showing dragged column with purchases)
class PurchasesOutlets extends React.Component {
    static propTypes = {
        statsTime: PropTypes.string.isRequired,
        outletIds: PropTypes.array.isRequired,
    };

    state = {
        outletsById: {},
        outletsOrdering: getFromPurchasesStorage('outletsOrdering') || this.props.outletIds,
        loading: false,
    }

    componentDidMount() {
        const { outletIds } = this.props;
        let { outletsOrdering } = this.state;
        outletsOrdering = filter(outletsOrdering, o => outletIds.includes(o));
        this.setState({ outletsOrdering }, () => this.loadOutlets(outletIds));
    }

    componentWillReceiveProps(nextProps) {
        const { outletIds } = nextProps;
        let { outletsById, outletsOrdering } = this.state;

        if (JSON.stringify(outletIds) !== JSON.stringify(this.props.outletIds)) {
            // get newly added outlet ids to then load them
            outletsById = pickBy(outletsById, o => {
                return outletIds.includes(o.id);
            });
            outletsOrdering = filter(outletsOrdering, o => outletIds.includes(o));
            let newOutletIds = outletIds;
            if (Object.keys(outletsById).length) {
                newOutletIds = difference(outletIds, outletsOrdering);
            }

            this.setState({ outletsById, outletsOrdering }, () => this.loadOutlets(newOutletIds));
        }
    }

    onMove = (dragIndex, hoverIndex) => {
        const { outletsOrdering } = this.state;
        const dragOutlet = outletsOrdering[dragIndex];

        this.setState(update(this.state, {
            outletsOrdering: {
                $splice: [
                    [dragIndex, 1],
                    [hoverIndex, 0, dragOutlet],
                ],
            },
        }), () => {
            setInPurchasesStorage({ outletsOrdering: this.state.outletsOrdering })
        });
    }

    /**
     * loadOutlets
     * loads outlet info and purchases for new outlet ids props
     *
     * @param {array} outletIds array of outlet ids
     */
    loadOutlets = (outletIds) => {
        let { outletsById, outletsOrdering, loading } = this.state;
        if (loading || !outletIds || !outletIds.length) return;

        this.setState({ loading: true });
        Promise.all(outletIds.map((id) => api.get(`outlet/${id}`)))
        .then(res => {
            res.forEach(o => {
                outletsById = Object.assign(outletsById, { [o.id]: o });
                if (!outletsOrdering.includes(o.id)) {
                    outletsOrdering = update(outletsOrdering, { $push: [o.id] });
                }
            });
        })
        .catch(() => $.snackbar({ content: 'There was an error loading outlets' }))
        .then(() => {
            this.setState({ outletsById, outletsOrdering, loading: false },
                () => this.loadInitialPurchases(outletIds))
        });
    }

    loadInitialPurchases = (outletIds) => {
        let { outletsById, loading } = this.state;
        if (loading || !outletIds || !outletIds.length) return;
        this.setState({ loading: true });

        Promise.all(outletIds.map((id) => api.get('purchase/list', {
            outlet_ids: [id],
            limit: 5,
        })))
        .then(res => {
            res.forEach((purchases) => {
                if (purchases && purchases.length) {
                    const outletIdx = outletsById.findIndex(o => o.id === purchases[0].outlet_id);
                    outletsById = update(outletsById, { [outletIdx]: { $merge: { purchases } } });
                }
            });
        })
        .catch(() => {
            $.snackbar({
                content: `There was an error getting outlets(${outletIds.join(', ')}) purchases!`,
            });
        })
        .then(() => this.setState({ outletsById, loading: false }));
    }

    loadMorePurchases = (outletId) => {
        let { outletsById = [], loading } = this.state;
        if (loading || !outletId) return;
        this.setState({ loading: true });
        const outletIdx = outletsById.findIndex(o => o.id === outletId);
        const outlet = outletsById[outletIdx];

        api.get('purchase/list', {
            outlet_ids: [outletId],
            last: last(outlet.purchases).id,
            limit: 5,
        })
        .then(res => {
            if (res && res.length) {
                outletsById = update(outletsById, { [outletIdx]: { purchases: { $push: res } } });
            }
        })
        .catch(() => {
            $.snackbar({
                content: `There was an error getting outlet(${outletId}) purchases!`,
            });
        })
        .then(() => this.setState({ outletsById, loading: false }));
    }

    render() {
        const { outletsById, outletsOrdering } = this.state;
        if (!Object.keys(outletsById).length) return null;

        return (
            <div className="purchases__outlets">
                {outletsOrdering.map((id, i) => {
                    const outlet = outletsById[id];
                    if (!outlet) return null;
                    return (
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
                    );
                })}
            </div>
        );
    }
}

export default DragDropContext(HTML5Backend)(PurchasesOutlets);

