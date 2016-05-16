import _ from 'lodash'
import moment from 'moment'
import React from 'react'
import ReactDOM from 'react-dom'
import OutletColumn from './outlet-column.js'
import update from 'react-addons-update';

export default class PurchasesOutlets extends React.Component {

    constructor(props) {
        super(props);
        
        this.state = {
            since: moment().utc().startOf('day'),
            outlets: {}
        }

        this.updateTimeInterval = this.updateTimeInterval.bind(this);
    }

    componentDidMount() {
        this.loadOutlets();
    }

    componentWillReceiveProps(nextProps) {  
        if(nextProps.selectedTimeToggle !== this.props.selectedTimeToggle) {
            this.setState({
                since: this.updateTimeInterval(nextProps.selectedTimeToggle)
            })
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if(JSON.stringify(prevProps.outletIds) !== JSON.stringify(this.props.outletIds)) {
            this.loadOutlets();
        } 
    }

    loadOutlets() {
        this.props.outletIds.forEach((outletId) => {
            $.ajax({
                url: '/api/outlet/get',
                type: 'GET',
                data: {
                    id: outletId
                },
                dataType: 'json',
                success: (response, status, xhr) => {
                    console.log(response);

                    if(!response.err) {
                        this.setState({
                            outlets : update(this.state.outlets, { [outletId] : { $set: response.data } } )
                        });
                    }  
                }
            });  
        });
    }

    /**
     * Updates the time interval the outelt data is loaded in
     * @return {moment} Moment.JS Object for the selected time
     */
    updateTimeInterval(selected) {
        var since = 0;

        switch(selected) {
            case 'today so far':
                since = moment().utc().startOf('day')
                break;
            case 'last 24 hours':
                since = moment().utc().subtract(1, 'day');
                break;
            case 'last 7 days':
                since = moment().utc().subtract(7, 'days');
                break;
            case 'last 30 days':
                since = moment().utc().subtract(30, 'days');
                break;
            case 'this year':
                since = moment().utc().subtract(1, 'year');
                break;
            case 'all time':
                since = null;
                break;
            default:
                since = moment().utc().startOf('day')
        }

       return since;
    }

    render() {
        var columns = [];

        Object.keys(this.state.outlets).forEach((outlet, i) => {
            columns.push(
                <OutletColumn 
                        outlet={this.state.outlets[outlet]}
                        since={this.state.since}
                        key={i} />
            );
        });

        return (
            <div className="outletStats">
                {columns}
            </div>
        )
    }
}