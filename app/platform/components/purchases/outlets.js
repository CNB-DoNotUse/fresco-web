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
        sortedIds: getFromPurchasesStorage('sortedIds') || this.props.outletIds,
        loading: false,
    }

    componentDidMount() {
        const { outletIds } = this.props;
        let { sortedIds } = this.state;
        sortedIds = filter(sortedIds, o => outletIds.includes(o));
        this.setState({ sortedIds }, () => this.loadOutlets(outletIds));
    }

    componentWillReceiveProps(nextProps) {
        const { outletIds } = nextProps;
        let { outletsById, sortedIds } = this.state;

        if (JSON.stringify(outletIds) !== JSON.stringify(this.props.outletIds)) {
            // get newly added outlet ids to then load them
            outletsById = pickBy(outletsById, o => {
                return outletIds.includes(o.id);
            });
            sortedIds = filter(sortedIds, o => outletIds.includes(o));
            let newOutletIds = outletIds;
            if (Object.keys(outletsById).length) {
                newOutletIds = difference(outletIds, sortedIds);
            }

            this.setState({ outletsById, sortedIds }, () => this.loadOutlets(newOutletIds));
        }
    }

    onMove = (dragIndex, hoverIndex) => {
        const { sortedIds } = this.state;
        const dragOutlet = sortedIds[dragIndex];

        this.setState(update(this.state, {
            sortedIds: {
                $splice: [
                    [dragIndex, 1],
                    [hoverIndex, 0, dragOutlet],
                ],
            },
        }), () => {
            setInPurchasesStorage({ sortedIds: this.state.sortedIds })
        });
    }

    /**
     * loadOutlets
     * loads outlet info and purchases for new outlet ids props
     *
     * @param {array} outletIds array of outlet ids
     */
    loadOutlets = (outletIds) => {
        let { outletsById, sortedIds, loading } = this.state;
        if (loading || !outletIds || !outletIds.length) return;

        this.setState({ loading: true });
        Promise.all(outletIds.map((id) => api.get(`outlet/${id}`)))
        .then(res => {
            res.forEach(o => {
                outletsById = Object.assign(outletsById, { [o.id]: o });
                if (!sortedIds.includes(o.id)) {
                    sortedIds = update(sortedIds, { $push: [o.id] });
                }
            });
        })
        .catch(() => $.snackbar({ content: 'There was an error loading outlets' }))
        .then(() => {
            this.setState({ outletsById, sortedIds, loading: false },
                () => this.loadInitialPurchases(outletIds))
        });
    }

    loadInitialPurchases = (outletIds) => {
        let { sortedIds, outletsById, loading } = this.state;
        if (loading || !sortedIds.length) return;
        this.setState({ loading: true });

        Promise.all(sortedIds.map(id => api.get('purchase/list', {
            outlet_ids: [id],
            limit: 5,
        })))
        .then(res => {
            res.forEach((purchases) => {
                if (purchases && purchases.length) {
                    outletsById = update(outletsById, { [purchases[0].outlet_id]: { $merge: { purchases } } });
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
        let { loading, outletsById } = this.state;
        if (loading || !outletId) return;
        this.setState({ loading: true });
        const outlet = outletsById[outletId];

        api.get('purchase/list', {
            outlet_ids: [outletId],
            last: last(outlet.purchases).id,
            limit: 5,
        })
        .then(res => {
            if (res && res.length) {
                outletsById = update(outletsById, { [outletId]: { purchases: { $push: res } } });
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
        const { outletsById, sortedIds } = this.state;
        if (!Object.keys(outletsById).length) return null;

        return (
            <div className="purchases__outlets">
                {sortedIds.map((id, i) => {
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

