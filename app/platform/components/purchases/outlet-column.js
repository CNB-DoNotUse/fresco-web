import React, { PropTypes } from 'react';
import moment from 'moment';
import utils from 'utils';
import OutletColumnHead from './outlet-column-head';
import OutletColumnList from './outlet-column-list';

/**
 * Outlet Column Component
 * @description Column for an indivdual outlet in outlet purchases page
 */
export default class OutletColumn extends React.Component {
    static propTypes = {
        outlet: PropTypes.object,
        since: PropTypes.object,
    };

    state = {
        userStats: {
            mau: 0,
            dau: 0,
            galleryCount: 0,
        },
        outlet: this.props.outlet,
        purchaseStats: {},
        dailyVideoCount: 0,
        purchases: [],
    }

    componentDidMount() {
        this.loadPurchaseStats();
        this.loadGoal();

        this.getPurchases(0, (purchases) => {
            this.setState({
                purchases,
                offset: purchases.length,
            });
        });
    }

    componentDidUpdate(prevProps) {
        // console.log('SINCE', prevProps.since !== this.props.since)
        if (prevProps.since !== this.props.since) {
            this.loadPurchaseStats();
        }
    }

    /**
     * Requests purchases for a passed outlet
     */
    getPurchases(offset, callback) {
        $.ajax({
            url: '/api/outlet/purchases/list',
            type: 'GET',
            data: {
                limit: 5,
                offset,
                sort: true,
                details: true,
                outlets: [this.state.outlet.id],
            },
            dataType: 'json',
            success: response => callback(response.data),
            error: (xhr, status, error) => {
                $.snackbar({ content: utils.resolveError(error) });
            },
        });
    }

    /**
     * Loads user stats for outlet and sets state
     */
    loadUserStats = () => {

    }

    /**
     * Loads stats for purchases
     */
    loadPurchaseStats = () => {
        const calculateStats = (stats) => {
            let amount = 0;

            if (typeof (stats.allTime) !== 'undefined') {
                amount = stats.allTime.amount;
            } else if (typeof (stats.since) !== 'undefined') {
                amount = stats.since.amount;
            }

            if (amount === 0) return;

            const stripeFee = (0.029 * amount) + 0.30;
            const userFee = 0.67 * amount;
            const margin = amount - stripeFee - userFee;

            stats.margin = '$' + Math.round(margin * 100) / 100;
            stats.revenue = '$' + amount;

            this.setState({ purchaseStats: stats });
        };

        $.ajax({
            url: '/api/outlet/purchases/stats',
            type: 'GET',
            data: {
                outlets: [this.state.outlet.id],
                since: this.props.since ? this.props.since.unix() * 1000 : null,
                now: Date.now(),
            },
            dataType: 'json',
            success: response => calculateStats(response),
        });
    }

    loadGoal = () => {
        $.ajax({
            url: '/api/outlet/purchases/stats',
            type: 'GET',
            data: {
                outlets: [this.state.outlet.id],
                since: moment().utc().startOf('day').unix() * 1000,
                now: Date.now(),
            },
            dataType: 'json',
            success: response => this.setState({ dailyVideoCount: response.data.videos }),
        });
    }

    /**
     * Manages goal adjustment
     * @param  {integer} increment Value to add to current goal
     */
    adjustGoal = (increment) => {
        const outlet = this.state.outlet;
        const params = { id: this.state.outlet.id };
        const updateGoal = (data) => {
            // Check if event set goal is still consistent with state goal
            // before sending out request
            if (data.goal !== this.state.outlet.goal) {
                return;
            }

            $.ajax({
                url: '/api/outlet/goal',
                type: 'POST',
                data,
                dataType: 'json',
                success: (response, status, xhr) => {
                    // Set again based on response data for consistency
                    // this.setState({
                    //     outlet: response
                    // });
                },
                error: (xhr, status, error) => {
                    $.snackbar({
                        content: utils.resolveError(error, 'There was an error updating this outlet\'s goal.'),
                    });
                },
            });
        };

        if (typeof (outlet.goal) === 'undefined' || !outlet.goal) {
            params.goal = 1;
        } else {
            params.goal = outlet.goal + increment;
        }

        // Set goal on outlet for state
        outlet.goal = params.goal;
        // Set for immediate feedback
        this.setState({ outlet });

        // Timeout in case of rapid clicks
        setTimeout(() => updateGoal(params), 1000);
    }

    /**
     * Scroll listener for main window
     */
    scroll = (e) => {
        const grid = e.target;
        const scrollTop = grid.scrollTop;
        const head = this.refs.columnHead.refs.head;
        const headClass = head.className;

        if (scrollTop <= 0) {
            head.className = headClass.replace(/\bshadow\b/, '');
        } else if (headClass.indexOf('shadow') === -1) {
            head.className += ' shadow';
        }

        // Check that nothing is loading and that we're at the end of the scroll,
        // and that we have a parent bind to load  more posts
        if (!this.loading && grid.scrollTop > ((grid.scrollHeight - grid.offsetHeight) - 200)) {
            // Set that we're loading
            this.loading = true;

            //Run load on parent call
            this.getPurchases(this.state.offset, (purchases) => {
                this.loading = false;

                //Disables scroll, and returns if posts are empty
                if(!purchases || purchases.length == 0){
                    return this.setState({
                        scrollable: false
                    });
                }

                //Set galleries from successful response, and unset loading
                this.setState({
                    purchases: this.state.purchases.concat(purchases),
                    offset : this.state.purchases.length + purchases.length
                });
            });
        }
    }

    render() {
        return (
            <div className="outletColumn" draggable={true}>
                <OutletColumnHead
                    ref="columnHead"
                    adjustGoal={this.adjustGoal}
                    userStats={this.state.userStats}
                    purchaseStats={this.state.purchaseStats}
                    dailyVideoCount={this.state.dailyVideoCount}
                    outlet={this.state.outlet} />

                <OutletColumnList
                    scroll={this.scroll}
                    purchases={this.state.purchases} />
            </div>
        );
    }
}


OutletColumn.defaultProps = {
    outlet: {}
}
