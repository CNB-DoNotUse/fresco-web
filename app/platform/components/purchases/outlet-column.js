import React, { PropTypes } from 'react';
import flow from 'lodash/flow';
import { DragSource, DropTarget } from 'react-dnd';
import OutletColumnHead from './outlet-column-head';
import OutletColumnPurchase from './outlet-column-purchase';

const columnSource = {
    beginDrag(props) {
        // console.log('begin dragging column', props.outletId);

        return { outletId: props.outletId };
    },
};

const columnTarget = {
    hover(targetProps, monitor) {
        const targetOutletId = targetProps.outletId;
        const sourceProps = monitor.getItem();
        const sourceOutletId = sourceProps.outletId;

        // console.log('dragging column', sourceProps, targetProps);
        if (sourceOutletId !== targetOutletId) {
            targetProps.onMove({ sourceOutletId, targetOutletId });
        }
    },
};


const initialState = {
    userStats: {
        mau: 0,
        dau: 0,
        galleryCount: 0,
    },
    purchaseStats: {},
    dailyVideoCount: 0,
    purchases: [],
    loading: false,
};

/**
 * Outlet Column Component
 * @description Column for an indivdual outlet in outlet purchases page
 */
class OutletColumn extends React.Component {
    static propTypes = {
        isDragging: PropTypes.bool.isRequired,
        connectDragSource: PropTypes.func.isRequired,
        connectDropTarget: PropTypes.func.isRequired,
        loadMorePurchases: PropTypes.func.isRequired,
        outlet: PropTypes.object.isRequired,
        since: PropTypes.object,
    };

    static defaultProps = {
        isDragging: false,
    };

    state = initialState;

    componentDidMount() {
        // this.loadPurchaseStats();
        // this.loadGoal();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.outlet.id !== this.props.outlet.id) {
            this.setState(initialState);
        }
    }

    // componentDidUpdate(prevProps) {
    //     // console.log('SINCE', prevProps.since !== this.props.since)
    //     // if (prevProps.since !== this.props.since) {
    //     //     this.loadPurchaseStats();
    //     // }
    // }

    /**
     * Scroll listener for main window
     */
    onScrollPurchases = (e) => {
        const { outlet, loadMorePurchases } = this.props;
        const grid = e.target;
        const scrollTop = grid.scrollTop;
        const head = this.columnHead.head;
        const headClass = head.className;

        if (scrollTop <= 0) {
            head.className = headClass.replace(/\bshadow\b/, '');
        } else if (headClass.indexOf('shadow') === -1) {
            head.className += ' shadow';
        }

        const endOfScroll = grid.scrollTop > ((grid.scrollHeight - grid.offsetHeight) - 200);

        // Check that nothing is loading and that we're at the end of the scroll,
        // and that we have a parent bind to load  more posts
        if (endOfScroll) {
            loadMorePurchases(outlet.id);
        }
    }

    /**
     * Loads user stats for outlet and sets state
     */
    // loadUserStats = () => {

    // }

    /**
     * Loads stats for purchases
     */
    // loadPurchaseStats = (lastPurchase = null) => {
    //     const calculateStats = ({ total_revenue = 0 }) => {
    //         if (!total_revenue) return;

    //         const stripeFee = (0.029 * total_revenue) + 0.30;
    //         const userFee = 0.67 * total_revenue;
    //         const margin = total_revenue - stripeFee - userFee;

    //         this.setState({ purchaseStats: {
    //             margin: `$${Math.round(margin * 100) / 100}`,
    //             revenue: `$${total_revenue}`,
    //         } });
    //     };

    //     const { outlet: { id } } = this.props;

    //     api.get('purchase/stats', {
    //         outlet_ids: [id],
    //         limit: 5,
    //         last: lastPurchase,
    //     })
    //     .then(calculateStats)
    //     .catch(() => {
    //         $.snackbar({
    //             content: `There was an error getting outlet(${id}) purchase stats`,
    //         });
    //     });
    // }

    // loadGoal = () => {
    //     $.ajax({
    //         url: '/api/outlet/purchases/stats',
    //         type: 'GET',
    //         data: {
    //             outlets: [this.state.outlet.id],
    //             since: moment().utc().startOf('day').unix() * 1000,
    //             now: Date.now(),
    //         },
    //         dataType: 'json',
    //         success: response => this.setState({ dailyVideoCount: response.data.videos }),
    //     });
    // }

    /**
     * Manages goal adjustment
     * @param  {integer} increment Value to add to current goal
     */
    // adjustGoal = (increment) => {
    //     const outlet = this.state.outlet;
    //     const params = { id: this.state.outlet.id };
    //     const updateGoal = (data) => {
    //         // Check if event set goal is still consistent with state goal
    //         // before sending out request
    //         if (data.goal !== this.state.outlet.goal) {
    //             return;
    //         }

    //         $.ajax({
    //             url: '/api/outlet/goal',
    //             type: 'POST',
    //             data,
    //             dataType: 'json',
    //             success: (response, status, xhr) => {
    //                 // Set again based on response data for consistency
    //                 // this.setState({
    //                 //     outlet: response
    //                 // });
    //             },
    //             error: (xhr, status, error) => {
    //                 $.snackbar({
    //                     content: utils.resolveError(error, 'There was an error updating this outlet\'s goal.'),
    //                 });
    //             },
    //         });
    //     };

    //     if (typeof (outlet.goal) === 'undefined' || !outlet.goal) {
    //         params.goal = 1;
    //     } else {
    //         params.goal = outlet.goal + increment;
    //     }

    //     // Set goal on outlet for state
    //     outlet.goal = params.goal;
    //     // Set for immediate feedback
    //     this.setState({ outlet });

    //     // Timeout in case of rapid clicks
    //     setTimeout(() => updateGoal(params), 1000);
    // }

    renderPurchasesList = ({ onScroll, purchases = [] }) => (
        <ul className="outlet-column__list" onScroll={onScroll}>
            {purchases
                ? purchases.map((purchase, i) => (
                    <OutletColumnPurchase purchase={purchase} key={i} />
                ))
                : null
            }
        </ul>
    )

    render() {
        const {
            isDragging,
            connectDragSource,
            connectDropTarget,
            outlet,
        } = this.props;

        return flow(connectDragSource, connectDropTarget)(
            <div
                draggable
                className="outlet-column"
                style={{
                    opacity: isDragging ? 0.5 : 1,
                }}
            >
                <OutletColumnHead
                    ref={r => { this.columnHead = r; }}
                    adjustGoal={this.adjustGoal}
                    userStats={this.state.userStats}
                    purchaseStats={this.state.purchaseStats}
                    dailyVideoCount={this.state.dailyVideoCount}
                    outlet={outlet}
                />

                {this.renderPurchasesList({
                    onScroll: this.onScrollPurchases,
                    purchases: outlet.purchases,
                })}
            </div>
        );
    }
}

export default flow(
    DragSource('outletColumn', columnSource, (connect, monitor) => ({
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging(),
    })),
    DropTarget('outletColumn', columnTarget, connect => ({
        connectDropTarget: connect.dropTarget(),
    }))
)(OutletColumn);

