import React from 'react'
import global from '../../../lib/global'
import moment from 'moment'
import OutletColumnHead from './outlet-column-head'
import OutletColumnList from './outlet-column-list'

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

            purchases: []
        }

        this.scroll = this.scroll.bind(this);
        this.loadUserStats = this.loadUserStats.bind(this);
        this.adjustGoal = this.adjustGoal.bind(this);
        this.drag = this.drag.bind(this);
        this.loadPurchaseStats = this.loadPurchaseStats.bind(this);
        this.loadPurchases = this.loadPurchases.bind(this);
    }

    componentDidMount() {
        this.instantiateColumn();  
    }   

    /**
     * Instantiates column to receive needed data
     */
    instantiateColumn() {
        this.loadPurchaseStats();

        this.loadPurchases(0, (purchases) => {
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

        $.get('/api/outlet/purchases/stats', {
            outlets: [this.state.outlet._id]
        }, (response) => {
            if(response.err || !response.data) {
                return $.snackbar({
                    content: 'There was an error receiving the purchases'
                });
            }

            calculateStats(response.data);
        });

        function calculateStats(stats) {
            var stripeFee = (.029 * stats.allTime) + .30,
                userFee = .67 * stats.allTime,
                margin = stats.allTime - stripeFee - userFee;

            stats.margin = '$' + Math.round(margin * 100) / 100;
            stats.revenue = '$' + stats.allTime;

            self.setState({
                purchaseStats: stats
            })
        }
    }

    /**
     * Requests purchases for a passed outlet
     */
    loadPurchases(offset, callback) {
        var params = {
            limit: 5,
            offset: offset,
            sort: true,
            details: true,
            outlets: [this.state.outlet._id]
        }

        $.ajax({
            url: '/api/outlet/purchases/list',
            type: 'GET',
            data: params,
            dataType: 'json',
            success: (response, status, xhr) => {
                //Do nothing, because of bad response
                if(!response.data || response.err)
                    $.snackbar({content: global.resolveError(response.err)});
                else {
                    var purchases = response.data.map(p => p.purchase);

                    callback(purchases);
                }
            },
            error: (xhr, status, error) => {
                $.snackbar({content: global.resolveError(error)});
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
            outlet.goal = params.goal;
        }

        console.log(params);

        //Set for immediate feedback
        this.setState({ outlet: outlet });

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
                success: (response, status, xhr) => {
                    if(response.err || !response.data)
                        $.snackbar({ 
                            content: global.resolveError(response.err, 'There was an error updating this outlet\'s goal.') 
                        });
                    else {
                        self.setState({
                            outlet : response.data
                        });
                    }
                },
                error: (xhr, status, error) => {
                    $.snackbar({ content: global.resolveError(error) });
                }
            }); 
        }
    }

    drag(e) {
        console.log(e);
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
            this.loadPurchases(this.state.offset, (purchases) => {
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
        var outlet = this.state.outlet,
            state = this.state,
            purchaseStats = this.state.purchaseStats;

        return (
            <div className="outletColumn" draggable={true}>
                <OutletColumnHead 
                    ref="columnHead"
                    adjustGoal={this.adjustGoal}
                    userStats={this.state.userStats}
                    purchaseStats={purchaseStats}
                    outlet={outlet} />

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