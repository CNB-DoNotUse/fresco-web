import React from 'react'
import global from '../../../lib/global'
import moment from 'moment'


/**
 * Outlet Column Component
 * @description Column for an indivdual outlet in outlet purchases page
 */

export default class OutletColumn extends React.Component {

    constructor(props) {
        super(props);
        
        this.state = {
            userStats : {
                mau: '400',
                dau: '120',
                galleryCount : '.12',
            },

            purchaseStats: {

            },

            goal : {

            },

            purchases: []
        }

        this.instantiateColumn();

        this.scroll = this.scroll.bind(this);
        this.loadUserStats = this.loadUserStats.bind(this);
        this.loadPurchaseStats = this.loadPurchaseStats.bind(this);
        this.loadPurchases = this.loadPurchases.bind(this);
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

    loadUserStats(outlet, callback) {

    }

    /**
     * Loads stats for purchases
     */
    loadPurchaseStats() {
        var self = this;

        $.get('/api/outlet/purchases/stats', {
            outlets: [this.props.outlet._id]
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
            limit: 20,
            offset: offset,
            sort: true,
            details: true,
            outlets: [this.props.outlet._id]
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
     * Scroll listener for main window
     */
    scroll(e) {
        var grid = e.target;

        //Check that nothing is loading and that we're at the end of the scroll,
        //and that we have a parent bind to load  more posts
        if(!this.loading && grid.scrollTop > ((grid.scrollHeight - grid.offsetHeight ) - 400)){
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
        var outlet = this.props.outlet,
            state = this.state;

        var purchases = state.purchases.map((purchase, i) => {
            return <OutletPurchase 
                        purchase={purchase}
                        key={i} />;
        });

        return (
            <div className="outletColumn">
                <div className="head">
                    <div className="title">
                        <div>
                            <h3>{outlet.title}</h3>
                            <a href={'/outlet/' + outlet._id}>
                                <span className="mdi mdi-logout-variant launch"></span>
                            </a>
                        </div>

                        <span className="mdi mdi-drag-vertical drag"></span>
                    </div>

                    <div className="users">
                        <ul>
                            <li>
                                <p>{state.userStats.mau}</p>
                                <p>MAU</p>
                            </li>
                            <li>
                                <p>{state.userStats.dau}</p>
                                <p>DAU</p>
                            </li>
                            <li>
                                <p>{state.userStats.galleryCount}</p>
                                <p>galleries/user/day</p>
                            </li>
                        </ul>
                    </div>

                    <div className="revenue">
                        <ul>
                            <li>
                                <span className="count">{state.purchaseStats.photos}</span>
                                <span>photos</span>
                            </li>
                            <li>
                                <span className="count">{state.purchaseStats.videos}</span>
                                <span>videos</span>
                            </li>
                            <li>
                                <span className="count">{state.purchaseStats.revenue}</span>
                                <span>revenue</span>
                            </li>
                            <li>
                                <span className="count">{state.purchaseStats.margin}</span>
                                <span>margin</span>
                            </li>
                        </ul>
                    </div>

                    <div className="goal">
                        <div className="circle">
                            <p className="fraction">
                                <span className="numerator">11</span>
                                <span className="denominator">/8</span>
                            </p>
                        </div>

                        <div className="actions">
                            <span className="mdi mdi-minus"></span>
                            <span className="mdi mdi-plus"></span>
                        </div>
                    </div>
                </div>

                <ul className="purchases" onScroll={this.scroll}>{purchases}</ul>
            </div>

        );
    }
}

class OutletPurchase extends React.Component {

    render() {
        var purchase = this.props.purchase,
            post = this.props.purchase.post,
            timestampText = '',
            lastDay = Date.now() - 86400000,
            media = '';

        var name = post.owner ? post.owner.firstname + ' ' + post.owner.lastname : post.byline;

        if(post.video !== null) {
            var source = '';

            if(global.isSafari(navigator.userAgent))
                source = post.video
            else 
                source = global.formatVideo(post.video);

            media = <video src={source} autoPlay={false} controls></video>
        } else {
            media = <img src={post.image} />
        }

        if(purchase.timestamp < lastDay) {
            timestampText = moment(purchase.timestamp).format('MMMM Do, YYYY')
        } else {
            timestampText = moment(post.timestamp).format('h:mm a') + ' UTC';
        }

        return (
            <li className="purchase">
                <div className="meta-top">
                    <h3>{name}</h3>

                    <span>{timestampText}</span>
                </div>

                <div className="media-cell">{media}</div>

                <div className="meta-bottom"></div>

            </li>

        )
    }
}

OutletColumn.defaultProps = {
    outlet: {}
}