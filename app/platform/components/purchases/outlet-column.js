import React, { PropTypes } from 'react';
import flow from 'lodash/flow';
import { findDOMNode } from 'react-dom';
import { DragSource, DropTarget } from 'react-dnd';
import { UserStats, PurchaseStats, OutletGoal } from './outlet-column-parts';
import OutletColumnPurchase from './outlet-column-purchase';

// based on following example
// https://github.com/gaearon/react-dnd/blob/master/examples/04%20Sortable/Simple/Card.js

const columnSource = {
    beginDrag(props) {
        return { id: props.id, index: props.index };
    },
};

const columnTarget = {
    hover(props, monitor, component) {
        const dragIndex = monitor.getItem().index;
        const hoverIndex = props.index;

        if (dragIndex === hoverIndex) return;

        // Determine rectangle on screen
        const hoverBoundingRect = findDOMNode(component).getBoundingClientRect();

        // Get horizontal middle
        const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2;

        // Determine mouse position
        const clientOffset = monitor.getClientOffset();

        // Get pixels to the left
        const hoverClientX = clientOffset.x - hoverBoundingRect.left;

        // Only perform the move when the mouse has crossed half of the items height
        // When dragging rightwards, only move when the cursor is right 50%
        // When dragging upwards, only move when the cursor is above 50%

        // // Dragging rightwards
        if (dragIndex < hoverIndex && hoverClientX < hoverMiddleX) {
            return;
        }

        // // Dragging leftwards
        if (dragIndex > hoverIndex && hoverClientX > hoverMiddleX) {
            return;
        }

        props.onMove(dragIndex, hoverIndex);

        // Note: we're mutating the monitor item here!
        // Generally it's better to avoid mutations,
        // but it's good here for the sake of performance
        // to avoid expensive index searches.
        monitor.getItem().index = hoverIndex;
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
        connectDragPreview: PropTypes.func.isRequired,
        connectDropTarget: PropTypes.func.isRequired,
        loadMorePurchases: PropTypes.func.isRequired,
        outlet: PropTypes.object.isRequired,
        since: PropTypes.object,
    };

    static defaultProps = {
        isDragging: false,
    };

    state = initialState;

    // componentDidMount() {
        // this.loadPurchaseStats();
        // this.loadGoal();
    // }

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
        const head = this.head;
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
            connectDragPreview,
            outlet,
        } = this.props;
        const { userStats, purchaseStats, dailyVideoCount } = this.state;

        return connectDropTarget(
            <div
                draggable
                className="outlet-column"
                style={{
                    opacity: isDragging ? 0 : 1,
                }}
            >
                {connectDragPreview(
                    <div
                        className="outlet-column__head"
                        ref={r => { this.head = r; }}
                    >
                        <div className="title">
                            <div>
                                <h3>{outlet.title}</h3>
                                <a href={`/outlet/${outlet.id}`}>
                                    <span className="mdi mdi-logout-variant launch" />
                                </a>
                            </div>

                            {connectDragSource(<span className="mdi mdi-drag-vertical drag" />)}
                        </div>

                        <UserStats {...userStats} />
                        <PurchaseStats {...purchaseStats} />
                        <OutletGoal
                            dailyVideoCount={dailyVideoCount}
                            adjustGoal={this.adjustGoal}
                            goal={outlet.goal || 0}
                        />
                    </div>
                )}

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
        connectDragPreview: connect.dragPreview(),
        isDragging: monitor.isDragging(),
    })),
    DropTarget('outletColumn', columnTarget, connect => ({
        connectDropTarget: connect.dropTarget(),
    }))
)(OutletColumn);

