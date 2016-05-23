import React from 'react'
import moment from 'moment'
import OutletColumnHead from './outlet-column-head'
import OutletColumnList from './outlet-column-list'
import global from '../../../lib/global'

/**
 * Outlet Column Component
 * @description Column for an indivdual outlet in outlet purchases page
 */
export default class OutletColumn extends React.Component {

    constructor(props) {
        super(props);
        
        this.state = {
            userStats : {
                mau: 0,
                dau: 0,
                galleryCount : 0,
            },

            outlet: this.props.outlet,

            purchaseStats: {},

            dailyVideoCount: 0,

            purchases: []
        }

        this.scroll = this.scroll.bind(this);
        this.loadUserStats = this.loadUserStats.bind(this);
        this.loadGoal = this.loadGoal.bind(this);
        this.adjustGoal = this.adjustGoal.bind(this);
        this.loadPurchaseStats = this.loadPurchaseStats.bind(this);
    }

    componentDidMount() {
        this.instantiateColumn();  
    }   

    componentDidUpdate(prevProps, prevState) {
        console.log('SINCE', prevProps.since !== this.props.since)
        if(prevProps.since !== this.props.since) {
            this.loadPurchaseStats();
        }
    }

    /**
     * Instantiates column to receive needed data
     */
    instantiateColumn() {
        this.loadPurchaseStats();
        this.loadGoal();

        this.getPurchases(0, (purchases) => {
            this.setState({
                purchases: purchases,
                offset: purchases.length
            })
        });
    }   

    /**
     * Loads user stats for outlet and sets state
     */
    loadUserStats() {

    }

    /**
     * Loads stats for purchases
     */
    loadPurchaseStats() {
        var self = this;

        $.ajax({
            url: '/api/outlet/purchases/stats',
            type: 'GET',
            data: {
                outlets: [this.state.outlet._id],
                since: this.props.since ? this.props.since.unix() * 1000 : null,
                now: Date.now()
            },
            dataType: 'json',
            success: (response, status, xhr) => {
                if(!response.err &&  response.data) {
                    calculateStats(response.data);
                }
            }
        }); 

        function calculateStats(stats) {
            var amount = 0;

            if(typeof(stats.allTime) !== 'undefined'){
                amount = stats.allTime.amount;
            } else if(typeof(stats.since) !== 'undefined'){
                amount = stats.since.amount;
            }

            if(amount == 0) return;

            var stripeFee = (.029 * amount) + .30,
                userFee = .67 * amount,
                margin = amount - stripeFee - userFee;

            stats.margin = '$' + Math.round(margin * 100) / 100;
            stats.revenue = '$' + amount;

            self.setState({
                purchaseStats: stats
            });
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
                offset: offset,
                sort: true,
                details: true,
                outlets: [this.state.outlet._id]
            },
            dataType: 'json',
            success: (response, status, xhr) => {
                //Do nothing, because of bad response
                if(!response.data || response.err)
                    $.snackbar({content: global.resolveError(response.err)});
                else {
                    callback(response.data);
                }
            },
            error: (xhr, status, error) => {
                $.snackbar({content: global.resolveError(error)});
            }
        }); 
    }

    loadGoal() {
        $.ajax({
            url: '/api/outlet/purchases/stats',
            type: 'GET',
            data: {
                outlets: [this.state.outlet._id],
                since: moment().utc().startOf('day').unix() * 1000,
                now: Date.now()
            },
            dataType: 'json',
            success: (response, status, xhr) => {
                if(!response.err &&  response.data) {
                    this.setState({
                        dailyVideoCount: response.data.videos
                    })
                }
            }
        }); 
    }

    /**
     * Manages goal adjustment
     * @param  {integer} increment Value to add to current goal
     */
    adjustGoal(increment) {
        var self = this,
            outlet = this.state.outlet,
            params = {
                id: this.state.outlet._id
            };

        if(typeof(outlet.goal) == 'undefined' || !outlet.goal) {
            params.goal = 1;
        } else {
            params.goal = outlet.goal + increment;
        }

        //Set goal on outlet for state
        outlet.goal = params.goal;
        //Set for immediate feedback
        this.setState({ outlet: outlet });

        //Timeout in case of rapid clicks
        setTimeout(() => {
            updateGoal(params);
        }, 1000);

        function updateGoal(params) {
            //Check if event set goal is still consistent with state goal 
            //before sending out request
            if(params.goal !== self.state.outlet.goal){
                return;
            }

            $.ajax({
                url: '/api/outlet/goal',
                type: 'POST',
                data: params,
                dataType: 'json',
                success: function(response, status, xhr) {
                    if(response.err || !response.data)
                        this.error();
                    else {
                        //Set again based on response data for consistency
                        // self.setState({
                        //     outlet : response.data
                        // });
                    }
                },
                error: (xhr, status, error) => {
                    $.snackbar({ 
                        content: global.resolveError(error, 'There was an error updating this outlet\'s goal.') 
                    });
                }
            }); 
        }
    }

    /**
     * Scroll listener for main window
     */
    scroll(e) {
        var grid = e.target,
            scrollTop = grid.scrollTop,
            head = this.refs.columnHead.refs.head,
            headClass = head.className;

        if(scrollTop <= 0) {
            head.className = headClass.replace(/\bshadow\b/,'');
        } else if(headClass.indexOf('shadow') == -1) {
            head.className += ' shadow';
        }

        //Check that nothing is loading and that we're at the end of the scroll,
        //and that we have a parent bind to load  more posts
        if(!this.loading && grid.scrollTop > ((grid.scrollHeight - grid.offsetHeight ) - 200)){
            //Set that we're loading
            this.loading  = true;

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